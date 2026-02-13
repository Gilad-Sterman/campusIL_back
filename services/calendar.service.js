import { google } from 'googleapis';
import { supabase, supabaseAdmin } from '../config/db.js';
import crypto from 'crypto';

class CalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate OAuth URL for calendar connection
   */
  generateAuthUrl(userId) {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error(`Failed to exchange code for tokens: ${error.message}`);
    }
  }

  /**
   * Encrypt token for secure storage
   */
  encryptToken(token) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt token for use
   */
  decryptToken(encryptedToken) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Save calendar connection for concierge
   */
  async saveCalendarConnection(userId, tokens) {
    try {
      // Encrypt tokens before storage
      const encryptedAccessToken = this.encryptToken(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token ? this.encryptToken(tokens.refresh_token) : null;

      // Update concierge record
      const { data, error } = await supabaseAdmin
        .from('concierges')
        .update({
          google_access_token_encrypted: encryptedAccessToken,
          google_refresh_token_encrypted: encryptedRefreshToken,
          calendar_connected_at: new Date().toISOString(),
          last_sync_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save calendar connection: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Calendar connection save failed: ${error.message}`);
    }
  }

  /**
   * Get calendar client for concierge
   */
  async getCalendarClient(userId) {
    try {
      // Get concierge record
      const { data: concierge, error } = await supabaseAdmin
        .from('concierges')
        .select('google_access_token_encrypted, google_refresh_token_encrypted')
        .eq('user_id', userId)
        .single();

      if (error || !concierge?.google_access_token_encrypted) {
        throw new Error('Calendar not connected');
      }

      // Decrypt tokens
      const accessToken = this.decryptToken(concierge.google_access_token_encrypted);
      const refreshToken = concierge.google_refresh_token_encrypted 
        ? this.decryptToken(concierge.google_refresh_token_encrypted) 
        : null;

      // Set credentials
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      return google.calendar({ version: 'v3', auth: this.oauth2Client });
    } catch (error) {
      throw new Error(`Failed to get calendar client: ${error.message}`);
    }
  }

  /**
   * Get available time slots for concierge
   */
  async getAvailableSlots(userId, startDate, endDate) {
    try {
      const calendar = await this.getCalendarClient(userId);

      // Get busy times from Google Calendar
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: 'primary' }]
        }
      });

      const busyTimes = response.data.calendars.primary.busy || [];

      // Generate 30-minute slots between 9 AM and 5 PM
      const availableSlots = this.generateTimeSlots(startDate, endDate, busyTimes);

      return availableSlots;
    } catch (error) {
      throw new Error(`Failed to get available slots: ${error.message}`);
    }
  }

  /**
   * Generate 30-minute time slots excluding busy times
   */
  generateTimeSlots(startDate, endDate, busyTimes) {
    const slots = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
      // Only generate slots for business hours (9 AM - 5 PM)
      const hour = current.getHours();
      if (hour >= 9 && hour < 17) {
        const slotEnd = new Date(current.getTime() + 30 * 60 * 1000); // 30 minutes
        
        // Check if slot conflicts with busy times
        const isAvailable = !busyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (current < busyEnd && slotEnd > busyStart);
        });

        if (isAvailable) {
          slots.push({
            start: new Date(current),
            end: new Date(slotEnd),
            available: true
          });
        }
      }
      
      // Move to next 30-minute slot
      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }

  /**
   * Create calendar event for appointment
   */
  async createCalendarEvent(userId, appointmentData) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const event = {
        summary: `Campus Israel Consultation - ${appointmentData.studentName}`,
        description: `Support session for application to ${appointmentData.university || 'Israeli universities'}`,
        start: {
          dateTime: appointmentData.startTime.toISOString(),
          timeZone: 'Asia/Jerusalem'
        },
        end: {
          dateTime: appointmentData.endTime.toISOString(),
          timeZone: 'Asia/Jerusalem'
        },
        attendees: [
          { email: appointmentData.studentEmail },
          { email: appointmentData.conciergeEmail }
        ],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      return {
        eventId: response.data.id,
        meetingUrl: response.data.conferenceData?.entryPoints?.[0]?.uri || null
      };
    } catch (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(userId, eventId, appointmentData) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const event = {
        summary: `Campus Israel Consultation - ${appointmentData.studentName}`,
        start: {
          dateTime: appointmentData.startTime.toISOString(),
          timeZone: 'Asia/Jerusalem'
        },
        end: {
          dateTime: appointmentData.endTime.toISOString(),
          timeZone: 'Asia/Jerusalem'
        }
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(userId, eventId) {
    try {
      const calendar = await this.getCalendarClient(userId);

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
  }

  /**
   * Check if concierge has calendar connected
   */
  async isCalendarConnected(userId) {
    try {
      const { data: concierge, error } = await supabaseAdmin
        .from('concierges')
        .select('google_access_token_encrypted')
        .eq('user_id', userId)
        .single();

      return !error && !!concierge?.google_access_token_encrypted;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect calendar for concierge
   */
  async disconnectCalendar(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('concierges')
        .update({
          google_access_token_encrypted: null,
          google_refresh_token_encrypted: null,
          google_calendar_id: null,
          last_sync_at: null
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to disconnect calendar: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Calendar disconnection failed: ${error.message}`);
    }
  }
}

export default new CalendarService();
