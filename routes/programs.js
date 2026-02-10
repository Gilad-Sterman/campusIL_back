import express from 'express';
import applicationController from '../controllers/application.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// All program routes require authentication
router.use(authenticateUser);

// GET /api/programs - Get programs with optional university filter
router.get('/', applicationController.getPrograms);

// GET /api/programs/:id/required-documents - Get required documents for a program
router.get('/:id/required-documents', validateUUID('id'), applicationController.getProgramRequiredDocuments);

export default router;
