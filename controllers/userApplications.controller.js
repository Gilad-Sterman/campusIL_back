import userApplicationsService from '../services/userApplications.service.js';

class UserApplicationsController {
  async list(req, res) {
    try {
      const userId = req.user.id;
      const data = await userApplicationsService.listByUser(userId);
      res.status(200).json({
        success: true,
        data,
        count: data.length
      });
    } catch (error) {
      console.error('UserApplicationsController.list error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list user applications'
      });
    }
  }

  async create(req, res) {
    try {
      const userId = req.user.id;
      const { program_id, university_id } = req.body;

      const row = await userApplicationsService.create(userId, {
        program_id,
        university_id
      });

      res.status(201).json({
        success: true,
        data: row,
        message: 'Added to My Applications'
      });
    } catch (error) {
      console.error('UserApplicationsController.create error:', error);
      const code = error.statusCode || 500;
      if (code >= 400 && code < 500) {
        return res.status(code).json({
          success: false,
          error: error.message
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create user application'
      });
    }
  }

  async patch(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { status, external_link } = req.body;

      const row = await userApplicationsService.updateById(id, userId, {
        status,
        external_link
      });

      res.status(200).json({
        success: true,
        data: row
      });
    } catch (error) {
      console.error('UserApplicationsController.patch error:', error);
      const code = error.statusCode || 500;
      if (code === 404 || (code >= 400 && code < 500)) {
        return res.status(code).json({
          success: false,
          error: error.message
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update user application'
      });
    }
  }
}

export default new UserApplicationsController();
