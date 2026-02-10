import express from 'express';
import applicationController from '../controllers/application.controller.js';
import universityController from '../controllers/university.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// GET /api/universities/costs - Get universities with cost data (public)
router.get('/costs', universityController.getUniversitiesWithCosts);

// GET /api/universities/travel-costs - Get travel costs by region (public)
router.get('/travel-costs', universityController.getTravelCosts);

// All other university routes require authentication
router.use(authenticateUser);

// GET /api/universities - Get universities with optional program filter
router.get('/', applicationController.getUniversities);

// GET /api/universities/:id - Get university by ID
router.get('/:id', validateUUID('id'), universityController.getUniversityById);

export default router;
