import adminService from '../services/admin.service.js';

class AdminController {
    // =============================================
    // DASHBOARD
    // =============================================
    async getDashboardStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const stats = await adminService.getDashboardStats(startDate, endDate);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('AdminController.getDashboardStats error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // =============================================
    // USERS
    // =============================================
    async getUsers(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const result = await adminService.getUsers({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search: search || '',
                status: status || ''
            });

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('AdminController.getUsers error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'blocked'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status. Must be "active" or "blocked"'
                });
            }

            const user = await adminService.updateUserStatus(id, status, req.user.id);

            res.status(200).json({
                success: true,
                data: user,
                message: `User ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully`
            });
        } catch (error) {
            console.error('AdminController.updateUserStatus error:', error);
            const statusCode = error.message.includes('Cannot block') ? 403 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!['student', 'admin'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid role. Must be "student" or "admin"'
                });
            }

            const user = await adminService.updateUserRole(id, role, req.user.id);

            res.status(200).json({
                success: true,
                data: user,
                message: `User ${role === 'admin' ? 'promoted to admin' : 'demoted to student'} successfully`
            });
        } catch (error) {
            console.error('AdminController.updateUserRole error:', error);
            const statusCode = error.message.includes('Cannot demote') ? 403 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    // =============================================
    // UNIVERSITIES
    // =============================================
    async getUniversities(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const result = await adminService.getUniversities({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search: search || '',
                status: status || ''
            });

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('AdminController.getUniversities error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async createUniversity(req, res) {
        try {
            const universityData = req.body;

            if (!universityData.name || !universityData.city) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and city are required'
                });
            }

            const university = await adminService.createUniversity(universityData);

            res.status(201).json({
                success: true,
                data: university,
                message: 'University created successfully'
            });
        } catch (error) {
            console.error('AdminController.createUniversity error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateUniversity(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const university = await adminService.updateUniversity(id, updateData);

            res.status(200).json({
                success: true,
                data: university,
                message: 'University updated successfully'
            });
        } catch (error) {
            console.error('AdminController.updateUniversity error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteUniversity(req, res) {
        try {
            const { id } = req.params;
            await adminService.deleteUniversity(id);

            res.status(200).json({
                success: true,
                message: 'University deleted successfully'
            });
        } catch (error) {
            console.error('AdminController.deleteUniversity error:', error);
            const statusCode = error.message.includes('Cannot delete') ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    // =============================================
    // PROGRAMS
    // =============================================
    async getPrograms(req, res) {
        try {
            const { page, limit, search, universityId, discipline, status } = req.query;
            const result = await adminService.getPrograms({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search: search || '',
                universityId: universityId || '',
                discipline: discipline || '',
                status: status || ''
            });

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('AdminController.getPrograms error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async createProgram(req, res) {
        try {
            const programData = req.body;

            if (!programData.name || !programData.university_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and university_id are required'
                });
            }

            const program = await adminService.createProgram(programData);

            res.status(201).json({
                success: true,
                data: program,
                message: 'Program created successfully'
            });
        } catch (error) {
            console.error('AdminController.createProgram error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateProgram(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const program = await adminService.updateProgram(id, updateData);

            res.status(200).json({
                success: true,
                data: program,
                message: 'Program updated successfully'
            });
        } catch (error) {
            console.error('AdminController.updateProgram error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteProgram(req, res) {
        try {
            const { id } = req.params;
            await adminService.deleteProgram(id);

            res.status(200).json({
                success: true,
                message: 'Program deleted successfully'
            });
        } catch (error) {
            console.error('AdminController.deleteProgram error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async bulkImportPrograms(req, res) {
        try {
            const { programs } = req.body;

            if (!Array.isArray(programs) || programs.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Programs array is required'
                });
            }

            const result = await adminService.bulkImportPrograms(programs);

            res.status(200).json({
                success: true,
                data: result,
                message: `Imported ${result.created} programs with ${result.errors.length} errors`
            });
        } catch (error) {
            console.error('AdminController.bulkImportPrograms error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // =============================================
    // COMMUNITY CONFIGS
    // =============================================
    async getCommunityConfigs(req, res) {
        try {
            const configs = await adminService.getCommunityConfigs();

            res.status(200).json({
                success: true,
                data: configs
            });
        } catch (error) {
            console.error('AdminController.getCommunityConfigs error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async upsertCommunityConfig(req, res) {
        try {
            const configData = req.body;

            if (!configData.discipline || !configData.region) {
                return res.status(400).json({
                    success: false,
                    error: 'Discipline and region are required'
                });
            }

            // Validate Discord link format
            if (configData.invite_link && !configData.invite_link.startsWith('https://discord.gg/')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Discord invite link format'
                });
            }

            const config = await adminService.upsertCommunityConfig(configData);

            res.status(200).json({
                success: true,
                data: config,
                message: 'Community config saved successfully'
            });
        } catch (error) {
            console.error('AdminController.upsertCommunityConfig error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteCommunityConfig(req, res) {
        try {
            const { id } = req.params;
            await adminService.deleteCommunityConfig(id);

            res.status(200).json({
                success: true,
                message: 'Community config deleted successfully'
            });
        } catch (error) {
            console.error('AdminController.deleteCommunityConfig error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // =============================================
    // AUDIT LOGS
    // =============================================
    async getAuditLogs(req, res) {
        try {
            const { page, limit, action, userId } = req.query;
            const result = await adminService.getAuditLogs({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                action: action || '',
                userId: userId || ''
            });

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('AdminController.getAuditLogs error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default new AdminController();
