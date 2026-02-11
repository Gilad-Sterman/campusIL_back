import express from 'express';
import studyBuddyController from '../controllers/studyBuddy.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// =============================================
// STUDY BUDDY ROUTES
// =============================================

// Get Discord invite link for current user
router.get('/discord-link', studyBuddyController.getDiscordLink);

// Get user's group assignment info (for debugging)
router.get('/group-info', studyBuddyController.getGroupInfo);

export default router;
