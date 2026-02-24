import storageService from './storageService.js';
import { supabase } from '../config/db.js';
import {
  getQuestionById,
  getTotalQuestions,
  isAnswerValidForQuestion,
  getVisibleQuestionIds,
  getNextVisibleQuestionId,
  isQuizCompleteForAnswers
} from '../config/quizQuestions.js';
import quizScoringService from './quizScoringService.js';
import { QUIZ_SCORING_CONTRACT_VERSION } from '../config/quizScoringConfig.js';

/**
 * Quiz service handling both anonymous and authenticated quiz flows
 * Built with Redis-ready architecture
 */
class QuizService {
  constructor() {
    this.storage = storageService;
  }

  _buildResultsPayload({ sessionId, completedAt, totalAnswers, avgScore, insights, source, scoringBundle, programMatches }) {
    return {
      contractVersion: QUIZ_SCORING_CONTRACT_VERSION,
      sessionId,
      completedAt,
      totalAnswers,
      avgScore,
      insights,
      canGetFullReport: true,
      metadata: {
        source,
        generatedAt: new Date().toISOString(),
        canGetFullReport: true,
        scoringModelVersion: scoringBundle?.modelVersion || null,
        scoringDiagnostics: scoringBundle?.diagnostics || null
      },
      stats: {
        totalAnswers,
        avgScore,
        completedAt
      },
      scoring: scoringBundle?.scoring || null,
      programMatches: programMatches || null
    };
  }

  async _buildComputedResults(answerEntries, { sessionId, completedAt, source }) {
    const normalizedAnswers = Array.isArray(answerEntries) ? answerEntries : [];
    const scoringBundle = quizScoringService.calculateScoring(normalizedAnswers);
    const numericAnalytics = quizScoringService.calculateNumericAnswerAnalytics(normalizedAnswers);
    
    // Generate enhanced insights using personality scoring
    const brillianceInsights = quizScoringService.generateBrillianceSummary(scoringBundle.scoring);
    const insights = {
      summary: brillianceInsights.summary,
      traits: brillianceInsights.traits,
      recommendation: this._generatePersonalizedRecommendation(scoringBundle.scoring)
    };

    // Get program matches for mini results
    let programMatches = null;
    try {
      const { default: programMatchingService } = await import('./programMatchingService.js');
      
      const studentProfile = {
        riasec_scores: scoringBundle.scoring.riasec_scores,
        personality_scores: scoringBundle.scoring.personality_scores,
        section_weights: scoringBundle.scoring.section_weights,
        brilliance_summary: brillianceInsights.summary,
        answers: normalizedAnswers
      };
      
      const matchingResult = await programMatchingService.matchPrograms(studentProfile);
      programMatches = matchingResult.success ? matchingResult.programs : null;
    } catch (error) {
      console.warn('Failed to get program matches for mini results:', error);
    }

    return this._buildResultsPayload({
      sessionId,
      completedAt,
      totalAnswers: normalizedAnswers.length,
      avgScore: numericAnalytics.numericAverage,
      insights,
      source,
      scoringBundle,
      programMatches
    });
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
      currentQuestionId: 1,
      totalQuestions: getTotalQuestions(),
      questionPath: [1],
      startedAt: new Date().toISOString(),
      status: 'in_progress'
    };

    await this.storage.setQuizSession(sessionId, sessionData);
    
    // Analytics event (no PII)
    await this._trackEvent('quiz_started', { sessionId, userType: 'anonymous' });
    
    return {
      sessionId,
      currentQuestion: 1,
      currentQuestionId: 1,
      totalQuestions: getTotalQuestions(),
      status: 'started'
    };
  }

  /**
   * Save anonymous quiz answer
   * @param {string} sessionId - Session identifier
   * @param {number} questionId - Question number
   * @param {*} answer - Answer value (type varies by question)
   */
  async saveAnonymousAnswer(sessionId, questionId, answer) {
    const session = await this.storage.getQuizSession(sessionId);
    if (!session) {
      throw new Error('Quiz session not found or expired');
    }

    const question = getQuestionById(questionId);
    if (!question) {
      throw new Error('Invalid question ID');
    }

    if (!isAnswerValidForQuestion(question, answer)) {
      throw new Error('Invalid answer value');
    }

    // Update answers array
    const answers = [...session.answers];
    const existingIndex = answers.findIndex(a => a.questionId === questionId);
    
    const answerData = {
      questionId,
      questionType: question.type,
      answer,
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      answers[existingIndex] = answerData;
    } else {
      answers.push(answerData);
    }

    const visibleQuestionIds = getVisibleQuestionIds(answers);
    const totalQuestions = visibleQuestionIds.length || getTotalQuestions();
    const currentQuestion = getNextVisibleQuestionId(questionId, answers) || questionId;
    const isComplete = answers.length >= totalQuestions;
    const questionPath = Array.isArray(session.questionPath) ? [...session.questionPath] : [1];
    if (currentQuestion && !questionPath.includes(currentQuestion)) {
      questionPath.push(currentQuestion);
    }

    const updatedData = {
      answers,
      currentQuestion: isComplete ? totalQuestions : currentQuestion,
      currentQuestionId: isComplete ? totalQuestions : currentQuestion,
      totalQuestions,
      questionPath,
      status: isComplete ? 'completed' : 'in_progress',
      lastAnsweredAt: new Date().toISOString()
    };

    await this.storage.updateQuizProgress(sessionId, updatedData);

    // Analytics event - log at milestones and completion
    const milestoneInterval = Math.max(1, Math.floor(totalQuestions / 4));
    const shouldLog = questionId % milestoneInterval === 0 || questionId === 1 || updatedData.status === 'completed';
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
      currentQuestionId: session.currentQuestionId || session.currentQuestion,
      totalQuestions: session.totalQuestions,
      answers: session.answers,
      status: session.status,
      startedAt: session.startedAt,
      questionPath: session.questionPath || [1],
      canResume: session.status === 'in_progress'
    };
  }

  /**
   * Generate mini results for anonymous users (pre-signup)
   * @param {string|Object} input - Session identifier or payload with answers
   */
  async generateMiniResults(input) {
    const payload = typeof input === 'string' ? { sessionId: input } : (input || {});
    const { sessionId, answers, completedAt } = payload;
    const hasAnswerPayload = Array.isArray(answers) && answers.length > 0;

    if (hasAnswerPayload) {
      if (!isQuizCompleteForAnswers(answers)) {
        throw new Error('Quiz not completed');
      }

      // Update the session status to completed if sessionId is provided
      if (sessionId) {
        try {
          await this.storage.updateQuizProgress(sessionId, {
            status: 'completed',
            answers: answers,
            lastAnsweredAt: completedAt || new Date().toISOString()
          });
        } catch (error) {
          console.warn('Failed to update session status:', error);
        }
      }

      await this._trackEvent('summary_viewed', {
        sessionId: sessionId || null,
        userType: 'anonymous',
        source: 'answers_payload'
      });

      return await this._buildComputedResults(answers, {
        sessionId: sessionId || null,
        completedAt: completedAt || new Date().toISOString(),
        source: 'backend_mini_payload'
      });
    }

    const session = await this.storage.getQuizSession(sessionId);
    if (!session || session.status !== 'completed') {
      throw new Error('Quiz not completed');
    }

    const answerEntries = session.answers || [];

    // Analytics event
    await this._trackEvent('summary_viewed', { sessionId, userType: 'anonymous' });

    return await this._buildComputedResults(answerEntries, {
      sessionId,
      completedAt: session.lastAnsweredAt,
      source: 'backend_mini'
    });
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

    // Calculate enhanced scoring for database storage
    const scoringBundle = quizScoringService.calculateScoring(session.answers);
    const brillianceInsights = quizScoringService.generateBrillianceSummary(scoringBundle.scoring);

    // Prepare quiz data for database
    const quizData = {
      user_id: userId,
      answers: session.answers,
      total_questions: session.totalQuestions || getTotalQuestions(),
      question_path: session.questionPath || [],
      section_weights: scoringBundle?.scoring?.sections || null,
      riasec_scores: scoringBundle?.scoring?.riasec || null,
      personality_scores: scoringBundle?.scoring?.personality || null,
      brilliance_summary: brillianceInsights?.summary || null,
      program_matches: null, // Will be populated when program matching is implemented
      cost_analysis: null,   // Will be populated when cost analysis is implemented
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
      const results = await this._buildComputedResults(completedQuiz.answers || [], {
        sessionId: completedQuiz.id,
        completedAt: completedQuiz.completed_at,
        source: 'backend_profile'
      });

      return {
        status: 'completed',
        canTakeQuiz: false,
        completedAt: completedQuiz.completed_at,
        quizId: completedQuiz.id,
        hasResults: true,
        answers: completedQuiz.answers,
        // Include all enhanced scoring data from database
        section_weights: completedQuiz.section_weights,
        riasec_scores: completedQuiz.riasec_scores,
        personality_scores: completedQuiz.personality_scores,
        brilliance_summary: completedQuiz.brilliance_summary,
        program_matches: completedQuiz.program_matches,
        cost_analysis: completedQuiz.cost_analysis,
        results
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
        currentQuestionId: progressQuiz.current_question_id || progressQuiz.current_question,
        totalQuestions: progressQuiz.total_questions || getVisibleQuestionIds(progressQuiz.answers || []).length || getTotalQuestions(),
        questionPath: progressQuiz.question_path || [],
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
  async saveQuizProgress(userId, progressDataInput) {
    const {
      currentQuestion,
      currentQuestionId,
      answers,
      questionPath,
      totalQuestions
    } = progressDataInput;

    const computedTotalQuestions = getVisibleQuestionIds(answers || []).length || totalQuestions || getTotalQuestions();

    const progressData = {
      user_id: userId,
      status: 'in_progress',
      current_question: currentQuestion,
      current_question_id: currentQuestionId || currentQuestion,
      answers: answers,
      question_path: questionPath || [],
      total_questions: computedTotalQuestions,
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
      if (!isQuizCompleteForAnswers(answers)) {
        throw new Error('Quiz is not complete for current visible required questions');
      }

      const visibleQuestionIds = getVisibleQuestionIds(answers);

      const { data: existingProgress } = await supabase
        .from('quiz_progress')
        .select('total_questions, question_path, section_weights')
        .eq('user_id', userId)
        .single();

      // Calculate enhanced scoring for database storage
      const scoringBundle = quizScoringService.calculateScoring(answers);
      const brillianceInsights = quizScoringService.generateBrillianceSummary(scoringBundle.scoring);

      const completionPayload = {
        user_id: userId,
        answers,
        total_questions: existingProgress?.total_questions || visibleQuestionIds.length || answers.length,
        question_path: existingProgress?.question_path || visibleQuestionIds,
        section_weights: scoringBundle?.scoring?.sections || existingProgress?.section_weights || null,
        riasec_scores: scoringBundle?.scoring?.riasec || null,
        personality_scores: scoringBundle?.scoring?.personality || null,
        brilliance_summary: brillianceInsights?.summary || null,
        program_matches: null, // Will be populated when program matching is implemented
        cost_analysis: null,   // Will be populated when cost analysis is implemented
        completed_at: new Date().toISOString()
      };

      // Save to quiz_answers
      const { data: completedQuiz, error: saveError } = await supabase
        .from('quiz_answers')
        .insert(completionPayload)
        .select()
        .single();

      if (saveError) {
        if (saveError.message?.includes('check_quiz_answers_valid')) {
          throw new Error('Failed to save completed quiz: check_quiz_answers_valid constraint is outdated for dynamic quiz length. Update DB constraint to accept non-empty answer arrays.');
        }
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
      // Calculate enhanced scoring for database storage
      const scoringBundle = quizScoringService.calculateScoring(session.answers);
      const brillianceInsights = quizScoringService.generateBrillianceSummary(scoringBundle.scoring);

      const quizData = {
        user_id: userId,
        answers: session.answers,
        total_questions: session.totalQuestions || getTotalQuestions(),
        question_path: session.questionPath || [],
        section_weights: scoringBundle?.scoring?.sections || null,
        riasec_scores: scoringBundle?.scoring?.riasec || null,
        personality_scores: scoringBundle?.scoring?.personality || null,
        brilliance_summary: brillianceInsights?.summary || null,
        program_matches: null, // Will be populated when program matching is implemented
        cost_analysis: null,   // Will be populated when cost analysis is implemented
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
            {
              currentQuestion: session.currentQuestion || localProgress + 1,
              currentQuestionId: session.currentQuestionId || session.currentQuestion || localProgress + 1,
              answers: session.answers,
              questionPath: session.questionPath || [],
              totalQuestions: session.totalQuestions || getTotalQuestions()
            }
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
          {
            currentQuestion: session.currentQuestion || session.answers.length + 1,
            currentQuestionId: session.currentQuestionId || session.currentQuestion || session.answers.length + 1,
            answers: session.answers,
            questionPath: session.questionPath || [],
            totalQuestions: session.totalQuestions || getTotalQuestions()
          }
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
   * Generate personalized recommendation based on personality scoring
   */
  _generatePersonalizedRecommendation(scoring) {
    const { conscientiousness } = scoring.personality;
    const sectionWeights = scoring.sections;
    
    let recommendation = "Sign up to get your personalized university matches and detailed profile analysis";
    
    // Customize recommendation based on conscientiousness
    if (conscientiousness && conscientiousness.score !== null) {
      if (conscientiousness.tag === 'High') {
        recommendation = "Your organized, goal-oriented approach makes you an excellent candidate for structured, challenging programs. ";
      } else if (conscientiousness.tag === 'Low') {
        recommendation = "Your flexible, creative approach would thrive in programs that offer variety and innovative learning methods. ";
      } else {
        recommendation = "Your balanced approach to structure and flexibility opens doors to diverse program options. ";
      }
    }
    
    // Add focus-based recommendation
    if (sectionWeights.degree && sectionWeights.degree.weight > 50) {
      recommendation += "Focus on academically rigorous programs with strong research opportunities.";
    } else if (sectionWeights.campus && sectionWeights.campus.weight > 35) {
      recommendation += "Look for universities with vibrant campus communities and extensive student life programs.";
    } else if (sectionWeights.city && sectionWeights.city.weight > 35) {
      recommendation += "Consider programs in cities that align with your lifestyle preferences and career goals.";
    } else {
      recommendation += "Explore programs that balance academic excellence with great campus and city experiences.";
    }
    
    return recommendation;
  }

  /**
   * Private method for basic insights generation
   * Will be replaced with LLM service later
   */
  _generateBasicInsights(avgScore) {
    if (!Number.isFinite(avgScore)) {
      return {
        summary: 'You completed the questionnaire successfully. We are preparing your personalized profile.',
        traits: ['Reflective', 'Engaged', 'Curious'],
        recommendation: 'Your full recommendation set will unlock once scoring formulas are finalized.'
      };
    }
    
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
