import quizService from '../services/quizService.js';

/**
 * Quiz controller handling anonymous and authenticated quiz flows
 */
class QuizController {
  /**
   * Start anonymous quiz session
   * POST /api/quiz/start
   */
  async startAnonymousQuiz(req, res) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      // Check rate limiting
      const rateCheck = await quizService.checkRateLimit(ipAddress, 'quiz_start');
      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: 'Too many quiz attempts',
          message: rateCheck.message,
          retryAfter: rateCheck.retryAfter
        });
      }

      const result = await quizService.startAnonymousQuiz(ipAddress);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Start quiz error:', error);
      res.status(500).json({
        error: 'Failed to start quiz',
        message: error.message
      });
    }
  }

  /**
   * Save anonymous quiz answer
   * POST /api/quiz/answer
   */
  async saveAnonymousAnswer(req, res) {
    try {
      const { sessionId, questionId, answer } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Validate required fields
      if (!sessionId || !questionId || !answer) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'sessionId, questionId, and answer are required'
        });
      }

      // Check rate limiting
      const rateCheck = await quizService.checkRateLimit(ipAddress, 'quiz_answer');
      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: 'Too many requests',
          message: rateCheck.message
        });
      }

      const result = await quizService.saveAnonymousAnswer(sessionId, questionId, answer);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Save answer error:', error);
      
      if (error.message.includes('not found') || error.message.includes('expired')) {
        return res.status(404).json({
          error: 'Quiz session not found',
          message: 'Quiz session has expired or does not exist'
        });
      }
      
      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Invalid input',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Failed to save answer',
        message: error.message
      });
    }
  }

  /**
   * Get anonymous quiz session
   * GET /api/quiz/session/:sessionId
   */
  async getAnonymousQuiz(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Missing session ID',
          message: 'Session ID is required'
        });
      }

      const quiz = await quizService.getAnonymousQuiz(sessionId);
      
      if (!quiz) {
        return res.status(404).json({
          error: 'Quiz not found',
          message: 'Quiz session not found or has expired'
        });
      }

      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({
        error: 'Failed to retrieve quiz',
        message: error.message
      });
    }
  }

  /**
   * Generate mini results for anonymous users
   * POST /api/quiz/mini-results
   */
  async generateMiniResults(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Missing session ID',
          message: 'Session ID is required'
        });
      }

      const results = await quizService.generateMiniResults(sessionId);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Generate mini results error:', error);
      
      if (error.message.includes('not completed')) {
        return res.status(400).json({
          error: 'Quiz not completed',
          message: 'Quiz must be completed to generate results'
        });
      }

      res.status(500).json({
        error: 'Failed to generate results',
        message: error.message
      });
    }
  }

  /**
   * Transfer anonymous quiz to user account (called during signup)
   * POST /api/quiz/transfer
   */
  async transferAnonymousQuiz(req, res) {
    try {
      const { sessionId, userId, userData, resolveConflicts } = req.body;

      if (!sessionId || !userId) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'sessionId and userId are required'
        });
      }

      let result;
      if (resolveConflicts) {
        // Use new conflict resolution method
        result = await quizService.transferAnonymousQuizWithConflicts(sessionId, userId, userData);
      } else {
        // Use original method for backward compatibility
        result = await quizService.transferAnonymousQuiz(sessionId, userId, userData);
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Transfer anonymous quiz error:', error);
      res.status(500).json({
        error: 'Failed to transfer quiz',
        message: error.message
      });
    }
  }

  /**
   * Get user's quiz state (for authenticated users)
   * GET /api/quiz/user-state
   */
  async getUserQuizState(req, res) {
    try {
      // This will be called with authenticated user context
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const state = await quizService.getUserQuizState(userId);
      
      res.json({
        success: true,
        data: state
      });
    } catch (error) {
      console.error('Get user quiz state error:', error);
      res.status(500).json({
        error: 'Failed to get quiz state',
        message: error.message
      });
    }
  }

  /**
   * Save quiz progress for authenticated user
   * POST /api/quiz/progress
   */
  async saveProgress(req, res) {
    try {
      const userId = req.user?.id;
      const { currentQuestion, answers } = req.body;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      if (!currentQuestion || !Array.isArray(answers)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'currentQuestion and answers array are required'
        });
      }

      const result = await quizService.saveQuizProgress(userId, currentQuestion, answers);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Save quiz progress error:', error);
      res.status(500).json({
        error: 'Failed to save quiz progress',
        message: error.message
      });
    }
  }

  /**
   * Complete quiz from progress
   * POST /api/quiz/complete-progress
   */
  async completeFromProgress(req, res) {
    try {
      const userId = req.user?.id;
      const { answers } = req.body;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      if (!Array.isArray(answers)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'answers array is required'
        });
      }

      const result = await quizService.completeQuizFromProgress(userId, answers);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Complete quiz from progress error:', error);
      res.status(500).json({
        error: 'Failed to complete quiz',
        message: error.message
      });
    }
  }

  /**
   * Health check for quiz service
   * GET /api/quiz/health
   */
  async healthCheck(req, res) {
    try {
      // Test storage service
      const storageHealthy = await quizService.storage.healthCheck();
      
      res.json({
        success: true,
        data: {
          storage: storageHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Quiz health check error:', error);
      res.status(500).json({
        error: 'Health check failed',
        message: error.message
      });
    }
  }
}

const quizController = new QuizController();

export default quizController;
