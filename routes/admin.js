import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateUser);
router.use(requireAdmin);

// =============================================
// DASHBOARD
// =============================================
router.get('/dashboard', adminController.getDashboardStats);

// =============================================
// USERS
// =============================================
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);

// =============================================
// STAFF MANAGEMENT
// =============================================
router.get('/staff', adminController.getStaff);
router.get('/staff/invites', adminController.getStaffInvites);
router.post('/staff/invite', adminController.inviteStaff);
router.delete('/staff/invites/:id', validateUUID('id'), adminController.revokeStaffInvite);
router.put('/staff/:id/role', validateUUID('id'), adminController.updateStaffRole);

// =============================================
// UNIVERSITIES
// =============================================
router.get('/universities', adminController.getUniversities);
router.post('/universities', adminController.createUniversity);
router.put('/universities/:id', validateUUID('id'), adminController.updateUniversity);
router.delete('/universities/:id', validateUUID('id'), adminController.deleteUniversity);

// =============================================
// PROGRAMS
// =============================================
router.get('/programs', adminController.getPrograms);
router.post('/programs', adminController.createProgram);
router.put('/programs/:id', adminController.updateProgram);
router.delete('/programs/:id', adminController.deleteProgram);
router.post('/programs/bulk-import', adminController.bulkImportPrograms);

// =============================================
// COMMUNITY CONFIGS
// =============================================
router.get('/community', adminController.getCommunityConfigs);
router.post('/community', adminController.upsertCommunityConfig);
router.delete('/community/:id', adminController.deleteCommunityConfig);

// =============================================
// AUDIT LOGS
// =============================================
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
