import applicationService from '../services/application.service.js';

class ApplicationController {
  // GET /api/applications - Get user's applications
  async getUserApplications(req, res) {
    try {
      const userId = req.user.id;
      
      const applications = await applicationService.getUserApplications(userId);

      res.status(200).json({
        success: true,
        data: applications,
        count: applications.length
      });
    } catch (error) {
      console.error('ApplicationController.getUserApplications error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applications/:id - Get specific application
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Application ID is required'
        });
      }

      const application = await applicationService.getApplicationById(id, userId);

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('ApplicationController.getApplicationById error:', error);
      
      const statusCode = error.message === 'Application not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/applications - Create new application
  async createApplication(req, res) {
    try {
      const userId = req.user.id;
      const applicationData = { ...req.body, user_id: userId };

      // Basic validation
      if (!applicationData.university_id || !applicationData.program_id) {
        return res.status(400).json({
          success: false,
          error: 'University and program are required fields'
        });
      }

      const newApplication = await applicationService.createApplication(applicationData);

      res.status(201).json({
        success: true,
        data: newApplication,
        message: 'Application created successfully'
      });
    } catch (error) {
      console.error('ApplicationController.createApplication error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/applications/:id - Update application
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Application ID is required'
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Update data is required'
        });
      }

      const updatedApplication = await applicationService.updateApplication(id, userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedApplication,
        message: 'Application updated successfully'
      });
    } catch (error) {
      console.error('ApplicationController.updateApplication error:', error);
      
      const statusCode = error.message === 'Application not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // DELETE /api/applications/:id - Delete application
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Application ID is required'
        });
      }

      await applicationService.deleteApplication(id, userId);

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error) {
      console.error('ApplicationController.deleteApplication error:', error);
      
      const statusCode = error.message === 'Application not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/applications/documents/:applicationId - Get application documents
  async getApplicationDocuments(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.user.id;

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          error: 'Application ID is required'
        });
      }

      const documents = await applicationService.getApplicationDocuments(applicationId, userId);

      res.status(200).json({
        success: true,
        data: documents,
        count: documents.length
      });
    } catch (error) {
      console.error('ApplicationController.getApplicationDocuments error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/applications/documents - Upload application document
  async uploadDocument(req, res) {
    try {
      const userId = req.user.id;
      const documentData = { ...req.body, user_id: userId };

      // Basic validation
      if (!documentData.application_id || !documentData.document_type || !documentData.file_url) {
        return res.status(400).json({
          success: false,
          error: 'Application ID, document type, and file URL are required'
        });
      }

      const newDocument = await applicationService.uploadDocument(documentData);

      res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('ApplicationController.uploadDocument error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ApplicationController();
