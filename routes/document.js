import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { documentPipelineGone } from '../middleware/gone.js';

const router = express.Router();

router.use(authenticateUser);

// All /api/documents/* — retired (HTTP 410). Controllers kept in repo for reference only.
router.use(documentPipelineGone);

export default router;
