import express from 'express';
import quizController from '../controllers/quiz.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Validation middleware for handling validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Anonymous quiz routes (no authentication required)
 */

// POST /api/quiz/start - Start anonymous quiz
router.post('/start', quizController.startAnonymousQuiz);

// POST /api/quiz/answer - Save anonymous quiz answer
router.post('/answer', [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  body('questionId').isInt({ min: 1, max: 30 }).withMessage('Question ID must be between 1 and 30'),
  body('answer').isInt({ min: 1, max: 5 }).withMessage('Answer must be between 1 and 5'),
  handleValidationErrors
], quizController.saveAnonymousAnswer);

// GET /api/quiz/session/:sessionId - Get anonymous quiz session
router.get('/session/:sessionId', [
  param('sessionId').isUUID().withMessage('Valid session ID required'),
  handleValidationErrors
], quizController.getAnonymousQuiz);

// POST /api/quiz/mini-results - Generate mini results for anonymous users
router.post('/mini-results', [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  handleValidationErrors
], quizController.generateMiniResults);

// POST /api/quiz/transfer - Transfer anonymous quiz to user account (during signup)
router.post('/transfer', [
  body('sessionId').isUUID().withMessage('Valid session ID required'),
  body('userId').isUUID().withMessage('Valid user ID required'),
  handleValidationErrors
], quizController.transferAnonymousQuiz);

/**
 * Authenticated quiz routes (require user authentication)
 */

// GET /api/quiz/user-state - Get user's quiz state
router.get('/user-state', authenticateUser, quizController.getUserQuizState);

// POST /api/quiz/progress - Save quiz progress
router.post('/progress', authenticateUser, [
  body('currentQuestion').isInt({ min: 1 }).withMessage('Current question must be a positive integer'),
  body('answers').isArray().withMessage('Answers must be an array')
], quizController.saveProgress);

// POST /api/quiz/complete-progress - Complete quiz from progress
router.post('/complete-progress', authenticateUser, [
  body('answers').isArray({ min: 5, max: 5 }).withMessage('Answers must be an array of exactly 5 items')
], quizController.completeFromProgress);

/**
 * System routes
 */

// GET /api/quiz/health - Health check
router.get('/health', quizController.healthCheck);

export default router;
