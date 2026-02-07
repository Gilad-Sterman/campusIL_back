import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticateUser, requireAdmin, authenticateAuthOnly } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// Public onboarding route (requires Supabase auth but no profile yet)
router.post('/staff/onboarding', authenticateAuthOnly, adminController.completeStaffOnboarding);

// All other routes require authentication and admin role
const adminProtected = [authenticateUser, requireAdmin];

// =============================================
// DASHBOARD
// =============================================
router.get('/dashboard', adminProtected, adminController.getDashboardStats);

// =============================================
// USERS
// =============================================
router.get('/users', adminProtected, adminController.getUsers);
router.get('/users/:id', adminProtected, validateUUID('id'), adminController.getUserById);
router.put('/users/:id/status', adminProtected, adminController.updateUserStatus);
router.put('/users/:id/role', adminProtected, adminController.updateUserRole);

// =============================================
// STAFF MANAGEMENT
// =============================================
router.get('/staff', adminProtected, adminController.getStaff);
router.get('/staff/invites', adminProtected, adminController.getStaffInvites);
router.post('/staff/invite', adminProtected, adminController.inviteStaff);
router.delete('/staff/invites/:id', adminProtected, validateUUID('id'), adminController.revokeStaffInvite);
router.put('/staff/:id/role', adminProtected, validateUUID('id'), adminController.updateStaffRole);

// =============================================
// UNIVERSITIES
// =============================================
router.get('/universities', adminProtected, adminController.getUniversities);
router.post('/universities', adminProtected, adminController.createUniversity);
router.put('/universities/:id', adminProtected, validateUUID('id'), adminController.updateUniversity);
router.delete('/universities/:id', adminProtected, validateUUID('id'), adminController.deleteUniversity);

// =============================================
// PROGRAMS
// =============================================
router.get('/programs', adminProtected, adminController.getPrograms);
router.post('/programs', adminProtected, adminController.createProgram);
router.put('/programs/:id', adminProtected, adminController.updateProgram);
router.delete('/programs/:id', adminProtected, adminController.deleteProgram);
router.post('/programs/bulk-import', adminProtected, adminController.bulkImportPrograms);

// =============================================
// COMMUNITY CONFIGS
// =============================================
router.get('/community', adminProtected, adminController.getCommunityConfigs);
router.post('/community', adminProtected, adminController.upsertCommunityConfig);
router.delete('/community/:id', adminProtected, adminController.deleteCommunityConfig);

// =============================================
// AUDIT LOGS
// =============================================
router.get('/audit-logs', adminProtected, adminController.getAuditLogs);

export default router;
