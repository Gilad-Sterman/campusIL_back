import { validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/db.js';
import calendarService from '../services/calendar.service.js';
import crypto from 'crypto';

// Get calendar connection status
export const getCalendarStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const isConnected = await calendarService.isCalendarConnected(userId);
    
    // Get connection details if connected
    let connectionDetails = null;
    if (isConnected) {
      const { data: concierge } = await supabase
        .from('concierges')
        .select('calendar_connected_at, last_sync_at')
        .eq('user_id', userId)
        .single();
      
      connectionDetails = concierge;
    }

    res.json({
      success: true,
      connected: isConnected,
      details: connectionDetails
    });

  } catch (error) {
    console.error('Get calendar status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check calendar status'
    });
  }
};

// Initiate Google Calendar OAuth connection
export const connectCalendar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure concierge row exists (auto-create if missing)
    const { data: concierge, error: conciergeError } = await supabase
      .from('concierges')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (conciergeError || !concierge) {
      // Auto-create concierge record from user profile
      const { error: insertError } = await supabaseAdmin
        .from('concierges')
        .insert({
          user_id: userId,
          name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
          email: req.user.email
        });

      if (insertError) {
        console.error('Failed to create concierge record:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Failed to initialize concierge profile'
        });
      }
    }

    // Generate OAuth URL with user ID encoded in state
    const authUrl = calendarService.generateAuthUrl(userId);

    res.json({
      success: true,
      authUrl: authUrl
    });

  } catch (error) {
    console.error('Connect calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate calendar connection'
    });
  }
};

// Handle Google OAuth callback
export const handleCalendarCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/concierge?calendar_callback=error&message=No+authorization+code`);
    }

    if (!state) {
      return res.redirect(`${process.env.FRONTEND_URL}/concierge?calendar_callback=error&message=Missing+state+parameter`);
    }

    // Decode user ID from state parameter
    const userId = state;

    // Exchange code for tokens
    const tokens = await calendarService.getTokensFromCode(code);

    // Save tokens directly to the concierge record
    await calendarService.saveCalendarConnection(userId, tokens);

    res.redirect(`${process.env.FRONTEND_URL}/concierge?calendar_callback=success`);

  } catch (error) {
    console.error('Calendar callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/concierge?calendar_callback=error&message=${encodeURIComponent(error.message)}`);
  }
};

// Complete calendar connection (called from frontend after callback)
export const completeCalendarConnection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { code } = req.body;

    // Exchange code for tokens
    const tokens = await calendarService.getTokensFromCode(code);

    // Save calendar connection
    const result = await calendarService.saveCalendarConnection(userId, tokens);

    res.json({
      success: true,
      message: 'Calendar connected successfully',
      data: {
        connected_at: result.calendar_connected_at,
        last_sync_at: result.last_sync_at
      }
    });

  } catch (error) {
    console.error('Complete calendar connection error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete calendar connection'
    });
  }
};

// Disconnect calendar
export const disconnectCalendar = async (req, res) => {
  try {
    const userId = req.user.id;

    await calendarService.disconnectCalendar(userId);

    res.json({
      success: true,
      message: 'Calendar disconnected successfully'
    });

  } catch (error) {
    console.error('Disconnect calendar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect calendar'
    });
  }
};

// Get available appointment slots
export const getAvailableSlots = async (req, res) => {
  try {
    const { conciergeId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range (max 2 weeks)
    const maxRange = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    if (end - start > maxRange) {
      return res.status(400).json({
        success: false,
        error: 'Date range cannot exceed 2 weeks'
      });
    }

    let targetConciergeId = conciergeId;

    // If no specific concierge requested, find one for the user
    if (!targetConciergeId) {
      const userId = req.user?.id;
      if (userId) {
        // Try to get user's preferred concierge
        const { data: preferredConcierge } = await supabase
          .rpc('get_user_preferred_concierge', { user_uuid: userId });
        
        if (preferredConcierge) {
          targetConciergeId = preferredConcierge;
        } else {
          // Get any available concierge (round-robin)
          const { data: availableConcierges } = await supabaseAdmin
            .from('concierges')
            .select('user_id')
            .eq('is_available', true)
            .not('google_access_token_encrypted', 'is', null)
            .limit(1);

          if (availableConcierges?.length > 0) {
            targetConciergeId = availableConcierges[0].user_id;
          }
        }
      }
    }

    if (!targetConciergeId) {
      return res.status(404).json({
        success: false,
        error: 'No available concierges found'
      });
    }

    // Get available slots
    const slots = await calendarService.getAvailableSlots(targetConciergeId, start, end);

    res.json({
      success: true,
      conciergeId: targetConciergeId,
      slots: slots
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get available slots'
    });
  }
};

// Get concierge's appointments
export const getConciergeAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate } = req.query;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        users!appointments_user_id_fkey(first_name, last_name, email)
      `)
      .eq('admin_user_id', userId)
      .order('scheduled_at', { ascending: true });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    res.json({
      success: true,
      appointments: appointments || []
    });

  } catch (error) {
    console.error('Get concierge appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    // Verify appointment belongs to this concierge
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('admin_user_id', userId)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Update appointment
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: updatedAppointment, error: updateError } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update appointment: ${updateError.message}`);
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
};

// Get list of available concierges (for students)
export const getAvailableConcierges = async (req, res) => {
  try {
    const { data: concierges, error } = await supabaseAdmin
      .from('concierges')
      .select('user_id, name, email, is_available')
      .eq('is_available', true)
      .not('google_access_token_encrypted', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch concierges: ${error.message}`);
    }

    res.json({
      success: true,
      concierges: concierges || []
    });
  } catch (error) {
    console.error('Get available concierges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available concierges'
    });
  }
};

// Book an appointment (for students)
export const bookAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { conciergeUserId, startTime, notes } = req.body;

    // Verify concierge exists and has calendar connected
    const { data: concierge, error: conciergeError } = await supabaseAdmin
      .from('concierges')
      .select('user_id, name, email')
      .eq('user_id', conciergeUserId)
      .eq('is_available', true)
      .not('google_access_token_encrypted', 'is', null)
      .single();

    if (conciergeError || !concierge) {
      return res.status(404).json({
        success: false,
        error: 'Concierge not available'
      });
    }

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const appointmentStart = new Date(startTime);
    const appointmentEnd = new Date(appointmentStart.getTime() + 30 * 60 * 1000);

    // Create Google Calendar event
    let eventResult = null;
    try {
      eventResult = await calendarService.createCalendarEvent(conciergeUserId, {
        studentName: `${student.first_name} ${student.last_name}`,
        studentEmail: student.email,
        conciergeEmail: concierge.email,
        startTime: appointmentStart,
        endTime: appointmentEnd
      });
    } catch (calError) {
      console.error('Calendar event creation failed:', calError);
      // Continue without calendar event — still save appointment
    }

    // Save appointment to database
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        user_id: userId,
        admin_user_id: conciergeUserId,
        scheduled_at: appointmentStart.toISOString(),
        duration_minutes: 30,
        status: 'scheduled',
        meeting_url: eventResult?.meetingUrl || null,
        google_event_id: eventResult?.eventId || null,
        notes: notes || null
      })
      .select()
      .single();

    if (appointmentError) {
      throw new Error(`Failed to save appointment: ${appointmentError.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        duration_minutes: appointment.duration_minutes,
        meeting_url: appointment.meeting_url,
        status: appointment.status,
        concierge_name: concierge.name
      }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to book appointment'
    });
  }
};

// Get student's own appointments
export const getStudentAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    // Enrich with concierge names
    const conciergeIds = [...new Set(appointments.map(a => a.admin_user_id))];
    let conciergeMap = {};

    if (conciergeIds.length > 0) {
      const { data: concierges } = await supabaseAdmin
        .from('concierges')
        .select('user_id, name, email')
        .in('user_id', conciergeIds);

      if (concierges) {
        conciergeMap = Object.fromEntries(concierges.map(c => [c.user_id, c]));
      }
    }

    const enriched = appointments.map(a => ({
      ...a,
      concierge_name: conciergeMap[a.admin_user_id]?.name || 'Concierge',
      concierge_email: conciergeMap[a.admin_user_id]?.email || null
    }));

    res.json({
      success: true,
      appointments: enriched
    });

  } catch (error) {
    console.error('Get student appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
};
