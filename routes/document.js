import express from 'express';
import documentController from '../controllers/document.controller.js';
import documentUploadController from '../controllers/documentUpload.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// GET /api/documents - Get user's documents
router.get('/', documentController.getUserDocuments);

// POST /api/documents/upload - Upload document with virus scanning
router.post('/upload', documentUploadController.getUploadMiddleware(), documentUploadController.uploadDocument);

// GET /api/documents/scan-status - Get virus scanner status
router.get('/scan-status', documentUploadController.getScannerStatus);

// POST /api/documents/recheck-scanner - Force recheck scanner availability
router.post('/recheck-scanner', documentUploadController.recheckScanner);

// POST /api/documents - Upload document (legacy endpoint)
router.post('/', documentController.uploadDocument);

// PUT /api/documents/:id - Update document
router.put('/:id', validateUUID('id'), documentController.updateDocument);

// DELETE /api/documents/:id - Delete document
router.delete('/:id', validateUUID('id'), documentController.deleteDocument);

// GET /api/documents/:id/view-url - Get signed URL for viewing document
router.get('/:id/view-url', validateUUID('id'), documentController.getDocumentViewUrl);

export default router;
