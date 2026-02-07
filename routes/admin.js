import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticateUser, requireAdmin, requireAdminEdit, authenticateAuthOnly } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

// Public onboarding route (requires Supabase auth but no profile yet)
router.post('/staff/onboarding', authenticateAuthOnly, adminController.completeStaffOnboarding);

// All other routes require authentication and admin role
const adminProtected = [authenticateUser, requireAdmin];
const adminEditProtected = [authenticateUser, requireAdminEdit];

// =============================================
// DASHBOARD
// =============================================
router.get('/dashboard', adminProtected, adminController.getDashboardStats);

// =============================================
// USERS
// =============================================
router.get('/users', adminProtected, adminController.getUsers);
router.get('/users/:id', adminProtected, validateUUID('id'), adminController.getUserById);
router.put('/users/:id/status', adminEditProtected, adminController.updateUserStatus);
router.put('/users/:id/role', adminEditProtected, adminController.updateUserRole);

// =============================================
// STAFF MANAGEMENT
// =============================================
router.get('/staff', adminProtected, adminController.getStaff);
router.get('/staff/invites', adminProtected, adminController.getStaffInvites);
router.post('/staff/invite', adminEditProtected, adminController.inviteStaff);
router.delete('/staff/invites/:id', adminEditProtected, validateUUID('id'), adminController.revokeStaffInvite);
router.put('/staff/:id/role', adminEditProtected, validateUUID('id'), adminController.updateStaffRole);

// =============================================
// UNIVERSITIES
// =============================================
router.get('/universities', adminProtected, adminController.getUniversities);
router.post('/universities', adminEditProtected, adminController.createUniversity);
router.put('/universities/:id', adminEditProtected, validateUUID('id'), adminController.updateUniversity);
router.delete('/universities/:id', adminEditProtected, validateUUID('id'), adminController.deleteUniversity);

// =============================================
// PROGRAMS
// =============================================
router.get('/programs', adminProtected, adminController.getPrograms);
router.post('/programs', adminEditProtected, adminController.createProgram);
router.put('/programs/:id', adminEditProtected, adminController.updateProgram);
router.delete('/programs/:id', adminEditProtected, adminController.deleteProgram);
router.post('/programs/bulk-import', adminEditProtected, adminController.bulkImportPrograms);

// =============================================
// COMMUNITY CONFIGS
// =============================================
router.get('/community', adminProtected, adminController.getCommunityConfigs);
router.post('/community', adminEditProtected, adminController.upsertCommunityConfig);
router.delete('/community/:id', adminEditProtected, adminController.deleteCommunityConfig);

// =============================================
// AUDIT LOGS
// =============================================
router.get('/audit-logs', adminProtected, adminController.getAuditLogs);

export default router;
