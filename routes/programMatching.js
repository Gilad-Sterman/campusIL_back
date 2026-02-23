import express from 'express';
import { matchPrograms, getMatchingTestData } from '../controllers/programMatchingController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * Program Matching Routes
 * All routes require authentication
 */

// POST /api/programs/match - Match programs for authenticated user
router.post('/match', authenticateUser, matchPrograms);

// GET /api/programs/match/test - Test endpoint for development (no auth for testing)
router.get('/match/test', getMatchingTestData);

export default router;
