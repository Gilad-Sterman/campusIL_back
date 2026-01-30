import storageService from './storageService.js';
import { supabase } from '../config/db.js';

/**
 * Quiz service handling both anonymous and authenticated quiz flows
 * Built with Redis-ready architecture
 */
class QuizService {
  constructor() {
    this.storage = storageService;
  }

  /**
   * Start anonymous quiz session
   * @param {string} ipAddress - User IP for analytics
   * @returns {Object} Session data with sessionId
   */
  async startAnonymousQuiz(ipAddress) {
    const sessionId = this.storage.generateSessionId();
    
    const sessionData = {
      sessionId,
      userType: 'anonymous',
      ipAddress,
      answers: [],
      currentQuestion: 1,
      totalQuestions: 5, // Updated for testing - was 30
      startedAt: new Date().toISOString(),
      status: 'in_progress'
    };

    await this.storage.setQuizSession(sessionId, sessionData);
    
    // Analytics event (no PII)
    await this._trackEvent('quiz_started', { sessionId, userType: 'anonymous' });
    
    return {
      sessionId,
      currentQuestion: 1,
      totalQuestions: 5, // Updated for testing - was 30
      status: 'started'
    };
  }

  /**
   * Save anonymous quiz answer
   * @param {string} sessionId - Session identifier
   * @param {number} questionId - Question number (1-30)
   * @param {number} answer - Answer value (1-5)
   */
  async saveAnonymousAnswer(sessionId, questionId, answer) {
    const session = await this.storage.getQuizSession(sessionId);
    if (!session) {
      throw new Error('Quiz session not found or expired');
    }

    // Validate answer
    if (questionId < 1 || questionId > 30) {
      throw new Error('Invalid question ID');
    }
    if (answer < 1 || answer > 5) {
      throw new Error('Invalid answer value');
    }

    // Update answers array
    const answers = [...session.answers];
    const existingIndex = answers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      answers[existingIndex] = { questionId, answer, timestamp: new Date().toISOString() };
    } else {
      answers.push({ questionId, answer, timestamp: new Date().toISOString() });
    }

    // Calculate next question - Updated for testing (was 30)
    const currentQuestion = Math.min(questionId + 1, 5);
    const isComplete = answers.length === 5;

    const updatedData = {
      answers,
      currentQuestion: isComplete ? 5 : currentQuestion,
      status: isComplete ? 'completed' : 'in_progress',
      lastAnsweredAt: new Date().toISOString()
    };

    await this.storage.updateQuizProgress(sessionId, updatedData);

    // Analytics event - only log milestone questions and completion
    const shouldLog = questionId % 5 === 0 || questionId === 1 || updatedData.status === 'completed';
    if (shouldLog) {
      await this._trackEvent('quiz_answered', { 
        sessionId, 
        questionId, 
        userType: 'anonymous',
        isComplete: updatedData.status === 'completed'
      });
    }

    return {
      success: true,
      currentQuestion: updatedData.currentQuestion,
      isComplete,
      totalAnswered: answers.length
    };
  }

  /**
   * Get anonymous quiz session data
   * @param {string} sessionId - Session identifier
   */
  async getAnonymousQuiz(sessionId) {
    const session = await this.storage.getQuizSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      currentQuestion: session.currentQuestion,
      totalQuestions: session.totalQuestions,
      answers: session.answers,
      status: session.status,
      startedAt: session.startedAt,
      canResume: session.status === 'in_progress'
    };
  }

  /**
   * Generate mini results for anonymous users (pre-signup)
   * @param {string} sessionId - Session identifier
   */
  async generateMiniResults(sessionId) {
    const session = await this.storage.getQuizSession(sessionId);
    if (!session || session.status !== 'completed') {
      throw new Error('Quiz not completed');
    }

    // Simple analysis for mini results
    const answers = session.answers.map(a => a.answer);
    const avgScore = answers.reduce((sum, val) => sum + val, 0) / answers.length;
    
    // Basic personality insights (will be enhanced with LLM later)
    const insights = this._generateBasicInsights(answers);
    
    // Analytics event
    await this._trackEvent('summary_viewed', { sessionId, userType: 'anonymous' });

    return {
      sessionId,
      completedAt: session.lastAnsweredAt,
      totalAnswers: answers.length,
      insights,
      avgScore: Math.round(avgScore * 10) / 10,
      canGetFullReport: true
    };
  }

  /**
   * Transfer anonymous quiz to user account (on signup)
   * @param {string} sessionId - Anonymous session ID
   * @param {string} userId - New user ID from auth
   * @param {Object} userData - User profile data
   */
  async transferAnonymousQuiz(sessionId, userId, userData) {
    const session = await this.storage.getQuizSession(sessionId);
    if (!session || session.status !== 'completed') {
      throw new Error('Quiz session not found or not completed');
    }

    // Prepare quiz data for database
    const quizData = {
      user_id: userId,
      answers: session.answers.map(a => a.answer), // Just the answer values for JSONB
      completed_at: session.lastAnsweredAt
    };

    // Save to database
    const { data, error } = await supabase
      .from('quiz_answers')
      .insert(quizData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save quiz: ${error.message}`);
    }

    // Clean up anonymous session
    await this.storage.deleteQuizSession(sessionId);

    // Analytics event
    await this._trackEvent('quiz_submitted', { 
      sessionId, 
      userId, 
      userType: 'registered' 
    });

    return {
      success: true,
      quizId: data.id,
      message: 'Quiz successfully saved to your account'
    };
  }

  /**
   * Get user's quiz state (for authenticated users)
   * @param {string} userId - User ID
   */
  async getUserQuizState(userId) {
    // First check for completed quiz
    const { data: completedQuiz, error: completedError } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (completedError && completedError.code !== 'PGRST116') {
      throw new Error(`Database error checking completed quiz: ${completedError.message}`);
    }

    if (completedQuiz) {
      return {
        status: 'completed',
        canTakeQuiz: false,
        completedAt: completedQuiz.completed_at,
        quizId: completedQuiz.id,
        hasResults: true,
        answers: completedQuiz.answers
      };
    }

    // Check for in-progress quiz
    const { data: progressQuiz, error: progressError } = await supabase
      .from('quiz_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      throw new Error(`Database error checking quiz progress: ${progressError.message}`);
    }

    if (progressQuiz) {
      return {
        status: 'in_progress',
        canTakeQuiz: true,
        currentQuestion: progressQuiz.current_question,
        answers: progressQuiz.answers,
        startedAt: progressQuiz.started_at,
        progressId: progressQuiz.id,
        hasResults: false
      };
    }

    return { 
      status: 'not_started', 
      canTakeQuiz: true 
    };
  }

  /**
   * Save quiz progress for authenticated user
   * @param {string} userId - User ID
   * @param {number} currentQuestion - Current question number
   * @param {Array} answers - Array of answers so far
   */
  async saveQuizProgress(userId, currentQuestion, answers) {
    const progressData = {
      user_id: userId,
      status: 'in_progress',
      current_question: currentQuestion,
      answers: answers,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('quiz_progress')
      .upsert(progressData, { 
        onConflict: 'user_id',
        returning: 'minimal'
      });

    if (error) {
      throw new Error(`Failed to save quiz progress: ${error.message}`);
    }

    return { success: true, message: 'Progress saved' };
  }

  /**
   * Complete quiz and move from progress to answers table
   * @param {string} userId - User ID
   * @param {Array} answers - Final answers array
   */
  async completeQuizFromProgress(userId, answers) {
    // Start transaction-like operations
    try {
      // Save to quiz_answers
      const { data: completedQuiz, error: saveError } = await supabase
        .from('quiz_answers')
        .insert({
          user_id: userId,
          answers: answers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save completed quiz: ${saveError.message}`);
      }

      // Delete from quiz_progress
      const { error: deleteError } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Warning: Failed to clean up quiz progress:', deleteError.message);
        // Don't throw error here - quiz is saved, cleanup can be done later
      }

      await this._trackEvent('quiz_completed', { 
        userId, 
        userType: 'authenticated',
        source: 'server_progress'
      });

      return {
        success: true,
        quizId: completedQuiz.id,
        message: 'Quiz completed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to complete quiz: ${error.message}`);
    }
  }

  /**
   * Transfer anonymous quiz to authenticated user with conflict resolution
   * @param {string} sessionId - Anonymous session ID
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   */
  async transferAnonymousQuizWithConflicts(sessionId, userId, userData) {
    // Get current user state
    const userState = await this.getUserQuizState(userId);
    
    // If user has completed quiz, ignore localStorage transfer
    if (userState.status === 'completed') {
      // Clear anonymous session
      await this.storage.deleteQuizSession(sessionId);
      return {
        transferred: false,
        reason: 'user_has_completed_quiz',
        message: 'User already has completed quiz, anonymous quiz ignored'
      };
    }

    // Get anonymous session
    const session = await this.storage.getQuizSession(sessionId);
    if (!session) {
      return {
        transferred: false,
        reason: 'no_anonymous_session',
        message: 'No anonymous session found'
      };
    }

    // Handle different scenarios
    if (session.status === 'completed') {
      // Anonymous quiz is completed - save to quiz_answers
      const quizData = {
        user_id: userId,
        answers: session.answers.map(a => a.answer),
        completed_at: session.lastAnsweredAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('quiz_answers')
        .insert(quizData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to transfer completed quiz: ${error.message}`);
      }

      // Clear both storages
      await this.storage.deleteQuizSession(sessionId);
      if (userState.status === 'in_progress') {
        await supabase.from('quiz_progress').delete().eq('user_id', userId);
      }

      await this._trackEvent('quiz_transferred', { 
        sessionId, 
        userId, 
        userType: 'registered',
        transferType: 'completed'
      });

      return {
        transferred: true,
        wasCompleted: true,
        quizId: data.id,
        message: 'Completed quiz transferred to your account'
      };
    } else if (session.status === 'in_progress') {
      // Anonymous quiz is in progress
      if (userState.status === 'in_progress') {
        // User has existing progress - compare and use most recent
        const localProgress = session.answers.length;
        const serverProgress = userState.answers.length;
        
        if (localProgress > serverProgress) {
          // Local has more progress, update server
          await this.saveQuizProgress(
            userId, 
            session.currentQuestion || localProgress + 1, 
            session.answers.map(a => a.answer)
          );
          await this.storage.deleteQuizSession(sessionId);
          
          return {
            transferred: true,
            wasCompleted: false,
            message: 'Local progress merged with server progress'
          };
        } else {
          // Server has more/equal progress, keep server version
          await this.storage.deleteQuizSession(sessionId);
          
          return {
            transferred: false,
            reason: 'server_progress_newer',
            message: 'Server progress is more recent, local progress discarded'
          };
        }
      } else {
        // No server progress, transfer local progress
        await this.saveQuizProgress(
          userId,
          session.currentQuestion || session.answers.length + 1,
          session.answers.map(a => a.answer)
        );
        await this.storage.deleteQuizSession(sessionId);

        return {
          transferred: true,
          wasCompleted: false,
          message: 'Quiz progress transferred to your account'
        };
      }
    }

    return {
      transferred: false,
      reason: 'unknown_session_state',
      message: 'Unable to determine session state'
    };
  }

  /**
   * Check rate limiting for quiz attempts
   * @param {string} identifier - IP address or user ID
   * @param {string} action - Action to rate limit
   */
  async checkRateLimit(identifier, action = 'quiz_start') {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      return { allowed: true };
    }

    const limits = {
      quiz_start: { max: 50, window: 3600 }, // 50 starts per hour (increased for dev)
      quiz_answer: { max: 1000, window: 3600 } // 1000 answers per hour (increased for dev)
    };

    const limit = limits[action];
    if (!limit) return { allowed: true };

    const current = await this.storage.getRateLimit(identifier, action);
    
    if (current.count >= limit.max) {
      return { 
        allowed: false, 
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: limit.window
      };
    }

    // Increment counter
    await this.storage.setRateLimit(identifier, action, current.count + 1, limit.window);
    
    return { allowed: true };
  }

  /**
   * Private method for basic insights generation
   * Will be replaced with LLM service later
   */
  _generateBasicInsights(answers) {
    const avgScore = answers.reduce((sum, val) => sum + val, 0) / answers.length;
    
    if (avgScore >= 4) {
      return {
        summary: "You show strong confidence and clear preferences in your academic journey.",
        traits: ["Decisive", "Goal-oriented", "Confident"],
        recommendation: "You're ready to pursue challenging programs that match your ambitions."
      };
    } else if (avgScore >= 3) {
      return {
        summary: "You have balanced perspectives and are thoughtful about your choices.",
        traits: ["Balanced", "Thoughtful", "Adaptable"],
        recommendation: "Consider programs that offer flexibility and diverse opportunities."
      };
    } else {
      return {
        summary: "You're exploring your options and taking time to consider different paths.",
        traits: ["Exploratory", "Open-minded", "Cautious"],
        recommendation: "Programs with strong support systems and broad foundations would suit you well."
      };
    }
  }

  /**
   * Private method for event tracking
   * Can be enhanced with proper analytics service
   */
  async _trackEvent(eventName, data) {
    // For now, just log - can be enhanced with analytics service
    console.log(`Quiz Event: ${eventName}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
    
    // Future: Send to analytics service, store in database, etc.
  }
}

// Singleton instance
const quizService = new QuizService();

export default quizService;
