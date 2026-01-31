import universityService from '../services/university.service.js';

class UniversityController {
  // GET /api/universities
  async getAllUniversities(req, res) {
    try {
      const { stats } = req.query;
      
      let universities;
      if (stats === 'true') {
        universities = await universityService.getUniversitiesWithStats();
      } else {
        universities = await universityService.getAllUniversities();
      }

      res.status(200).json({
        success: true,
        data: universities,
        count: universities.length
      });
    } catch (error) {
      console.error('UniversityController.getAllUniversities error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/universities/:id
  async getUniversityById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'University ID is required'
        });
      }

      const university = await universityService.getUniversityById(id);

      res.status(200).json({
        success: true,
        data: university
      });
    } catch (error) {
      console.error('UniversityController.getUniversityById error:', error);
      
      const statusCode = error.message === 'University not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/universities
  async createUniversity(req, res) {
    try {
      const universityData = req.body;

      // Basic validation
      if (!universityData.name || !universityData.city) {
        return res.status(400).json({
          success: false,
          error: 'Name and city are required fields'
        });
      }

      const newUniversity = await universityService.createUniversity(universityData);

      res.status(201).json({
        success: true,
        data: newUniversity,
        message: 'University created successfully'
      });
    } catch (error) {
      console.error('UniversityController.createUniversity error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/universities/:id
  async updateUniversity(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'University ID is required'
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Update data is required'
        });
      }

      const updatedUniversity = await universityService.updateUniversity(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedUniversity,
        message: 'University updated successfully'
      });
    } catch (error) {
      console.error('UniversityController.updateUniversity error:', error);
      
      const statusCode = error.message === 'University not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/universities/costs - Get universities with cost data for Cost Calculator
  async getUniversitiesWithCosts(req, res) {
    try {
      const universities = await universityService.getUniversitiesWithCosts();

      res.status(200).json({
        success: true,
        data: universities,
        count: universities.length
      });
    } catch (error) {
      console.error('UniversityController.getUniversitiesWithCosts error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/universities/travel-costs - Get travel costs by region
  async getTravelCosts(req, res) {
    try {
      const travelCosts = await universityService.getTravelCosts();

      res.status(200).json({
        success: true,
        data: travelCosts
      });
    } catch (error) {
      console.error('UniversityController.getTravelCosts error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new UniversityController();
