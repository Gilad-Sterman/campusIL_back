import express from 'express';
import universityController from '../controllers/university.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateUniversityCreate, validateUniversityUpdate, validateUUID } from '../middleware/validation.js';

const router = express.Router();

// GET /api/universities/costs - Get universities with cost data (public)
router.get('/costs', universityController.getUniversitiesWithCosts);

// GET /api/universities/travel-costs - Get travel costs by region (public)
router.get('/travel-costs', universityController.getTravelCosts);

// GET /api/universities - Get all universities (public)
// Query params: ?stats=true (to include program counts)
router.get('/', universityController.getAllUniversities);

// GET /api/universities/:id - Get university by ID (public)
router.get('/:id', validateUUID('id'), universityController.getUniversityById);

// POST /api/universities - Create new university (admin only)
router.post('/', requireAdmin, validateUniversityCreate, universityController.createUniversity);

// PUT /api/universities/:id - Update university (admin only)
router.put('/:id', requireAdmin, validateUniversityUpdate, universityController.updateUniversity);

export default router;
