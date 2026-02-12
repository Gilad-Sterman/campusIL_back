import searchService from '../services/search.service.js';

class SearchController {
  // =============================================
  // APPLICATION HUB SEARCH ENDPOINTS
  // =============================================

  /**
   * GET /api/search/programs
   * Elastic-style search for Application Hub intro page
   * Query params: q (search query), limit
   */
  async searchPrograms(req, res) {
    try {
      const { q: query = '', limit } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);

      const results = await searchService.searchPrograms(query, options);

      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('SearchController.searchPrograms error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/search/domains/:domain/programs
   * Search programs within a specific domain for domain pages
   * Query params: q (search query), limit
   */
  async searchProgramsByDomain(req, res) {
    try {
      const { domain } = req.params;
      const { q: query = '', limit } = req.query;

      // Validate domain
      const validDomains = [
        'Future Builders',
        'Human Insight & Impact',
        'Power, Policy & Influence',
        'Culture & Creativity',
        'Explorative Paths'
      ];

      if (!validDomains.includes(domain)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid domain. Must be one of: ' + validDomains.join(', ')
        });
      }

      const options = {};
      if (limit) options.limit = parseInt(limit);

      const results = await searchService.searchProgramsByDomain(domain, query, options);

      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('SearchController.searchProgramsByDomain error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/search/programs/:id
   * Get detailed program information for "More Information" functionality
   */
  async getProgramDetails(req, res) {
    try {
      const { id } = req.params;

      // Basic UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid program ID format'
        });
      }

      const program = await searchService.getProgramDetails(id);

      if (!program) {
        return res.status(404).json({
          success: false,
          error: 'Program not found'
        });
      }

      res.status(200).json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('SearchController.getProgramDetails error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/search/domains
   * Get all available domains with program counts
   */
  async getDomains(req, res) {
    try {
      const domains = await searchService.getDomains();

      res.status(200).json({
        success: true,
        data: domains
      });
    } catch (error) {
      console.error('SearchController.getDomains error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new SearchController();
