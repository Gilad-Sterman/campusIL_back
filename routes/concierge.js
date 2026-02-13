import express from 'express';
import { body } from 'express-validator';
import { authenticateUser, requireConcierge, optionalAuth } from '../middleware/auth.js';
import {
  getCalendarStatus,
  connectCalendar,
  handleCalendarCallback,
  completeCalendarConnection,
  disconnectCalendar,
  getAvailableSlots,
  getAvailableConcierges,
  bookAppointment,
  getStudentAppointments,
  getConciergeAppointments,
  updateAppointmentStatus
} from '../controllers/concierge.controller.js';

const router = express.Router();

// Calendar connection routes
router.get('/calendar/status', authenticateUser, requireConcierge, getCalendarStatus);
router.post('/calendar/connect', authenticateUser, requireConcierge, connectCalendar);
router.get('/calendar/callback', handleCalendarCallback); // No auth needed for OAuth callback
router.post('/calendar/complete', 
  authenticateUser, 
  requireConcierge,
  [
    body('code').notEmpty().withMessage('Authorization code is required')
  ],
  completeCalendarConnection
);
router.delete('/calendar/disconnect', authenticateUser, requireConcierge, disconnectCalendar);

// Student-facing routes
router.get('/list', authenticateUser, getAvailableConcierges);
router.get('/availability', optionalAuth, getAvailableSlots);
router.post('/book',
  authenticateUser,
  [
    body('conciergeUserId').notEmpty().withMessage('Concierge ID is required'),
    body('startTime').notEmpty().isISO8601().withMessage('Valid start time is required')
  ],
  bookAppointment
);
router.get('/my-appointments', authenticateUser, getStudentAppointments);
router.get('/appointments', authenticateUser, requireConcierge, getConciergeAppointments);
router.put('/appointments/:appointmentId/status',
  authenticateUser,
  requireConcierge,
  [
    body('status')
      .isIn(['scheduled', 'completed', 'cancelled'])
      .withMessage('Status must be scheduled, completed, or cancelled'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  updateAppointmentStatus
);

export default router;
