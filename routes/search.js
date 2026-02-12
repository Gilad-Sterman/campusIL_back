import express from 'express';
import searchController from '../controllers/search.controller.js';

const router = express.Router();

// =============================================
// APPLICATION HUB SEARCH ROUTES
// =============================================

// GET /api/search/programs - Elastic-style search for intro page
// Public endpoint - no authentication required for discovery
router.get('/programs', searchController.searchPrograms);

// GET /api/search/domains - Get all available domains
// Public endpoint - no authentication required for discovery
router.get('/domains', searchController.getDomains);

// GET /api/search/domains/:domain/programs - Search within specific domain
// Public endpoint - no authentication required for discovery
router.get('/domains/:domain/programs', searchController.searchProgramsByDomain);

// GET /api/search/programs/:id - Get program details for "More Information"
// Public endpoint - no authentication required for discovery
router.get('/programs/:id', searchController.getProgramDetails);

export default router;
