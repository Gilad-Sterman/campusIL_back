import express from 'express';
import applicationController from '../controllers/application.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// All application routes require authentication
router.use(authenticateUser);

// GET /api/applications - Get user's applications
router.get('/', applicationController.getUserApplications);

// GET /api/applications/:id - Get specific application
router.get('/:id', validateUUID('id'), applicationController.getApplicationById);

// POST /api/applications - Create new application
router.post('/', applicationController.createApplication);

// PUT /api/applications/:id - Update application
router.put('/:id', validateUUID('id'), applicationController.updateApplication);

// DELETE /api/applications/:id - Delete application
router.delete('/:id', validateUUID('id'), applicationController.deleteApplication);

// GET /api/applications/documents/:applicationId - Get application documents
router.get('/documents/:applicationId', validateUUID('applicationId'), applicationController.getApplicationDocuments);

// POST /api/applications/documents - Upload application document
router.post('/documents', applicationController.uploadDocument);

export default router;
