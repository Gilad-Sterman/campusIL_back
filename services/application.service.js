import { supabase, supabaseAdmin } from '../config/db.js';

class ApplicationService {
  // Get all applications for a user
  async getUserApplications(userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          program:programs(
            id, 
            name, 
            degree_level, 
            duration_years,
            university:universities(id, name, city, logo_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ApplicationService.getUserApplications error:', error);
      throw error;
    }
  }

  // Get specific application by ID (user must own it)
  async getApplicationById(id, userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          program:programs(
            id, 
            name, 
            degree_level, 
            duration_years, 
            description,
            university:universities(id, name, city, logo_url, website_url, application_url)
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Application not found');
        }
        throw new Error(`Failed to fetch application: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ApplicationService.getApplicationById error:', error);
      throw error;
    }
  }

  // Create new application
  async createApplication(applicationData) {
    try {
      const { 
        user_id, 
        university_id, 
        program_id, 
        status = 'draft',
        application_deadline,
        notes 
      } = applicationData;

      // Validate required fields
      if (!user_id || !university_id || !program_id) {
        throw new Error('User ID, university ID, and program ID are required');
      }

      // Check if application already exists for this user/university/program
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user_id)
        .eq('university_id', university_id)
        .eq('program_id', program_id)
        .single();

      if (existingApp) {
        throw new Error('Application already exists for this program');
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          user_id,
          university_id,
          program_id,
          status,
          application_deadline: application_deadline || null,
          notes: notes?.trim() || null,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          university:universities(id, name, city, logo_url),
          program:programs(id, name, degree_type, duration_years)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create application: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ApplicationService.createApplication error:', error);
      throw error;
    }
  }

  // Update application
  async updateApplication(id, userId, updateData) {
    try {
      // Remove undefined values and trim strings
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id' && key !== 'user_id') {
          cleanData[key] = typeof updateData[key] === 'string' 
            ? updateData[key].trim() 
            : updateData[key];
        }
      });

      // Add updated timestamp
      cleanData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('applications')
        .update(cleanData)
        .eq('id', id)
        .eq('user_id', userId)
        .select(`
          *,
          program:programs(
            id, 
            name, 
            degree_level, 
            duration_years,
            university:universities(id, name, city, logo_url)
          )
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Application not found');
        }
        throw new Error(`Failed to update application: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ApplicationService.updateApplication error:', error);
      throw error;
    }
  }

  // Delete application
  async deleteApplication(id, userId) {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete application: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('ApplicationService.deleteApplication error:', error);
      throw error;
    }
  }

  // Get application documents
  async getApplicationDocuments(applicationId, userId) {
    try {
      // First verify the application belongs to the user
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single();

      if (!application) {
        throw new Error('Application not found');
      }

      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ApplicationService.getApplicationDocuments error:', error);
      throw error;
    }
  }

  // Upload document
  async uploadDocument(documentData) {
    try {
      const { 
        user_id, 
        application_id, 
        document_type, 
        file_name, 
        file_url, 
        file_size,
        notes 
      } = documentData;

      // Validate required fields
      if (!user_id || !application_id || !document_type || !file_url) {
        throw new Error('User ID, application ID, document type, and file URL are required');
      }

      // Verify the application belongs to the user
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('id', application_id)
        .eq('user_id', user_id)
        .single();

      if (!application) {
        throw new Error('Application not found');
      }

      const { data, error } = await supabase
        .from('application_documents')
        .insert([{
          user_id,
          application_id,
          document_type,
          file_name: file_name?.trim() || null,
          file_url: file_url.trim(),
          file_size: file_size || null,
          notes: notes?.trim() || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to upload document: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ApplicationService.uploadDocument error:', error);
      throw error;
    }
  }

  // Get application statistics for user
  async getUserApplicationStats(userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch application stats: ${error.message}`);
      }

      const stats = {
        total: data.length,
        draft: 0,
        submitted: 0,
        under_review: 0,
        accepted: 0,
        rejected: 0,
        waitlisted: 0
      };

      data.forEach(app => {
        if (stats[app.status] !== undefined) {
          stats[app.status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('ApplicationService.getUserApplicationStats error:', error);
      throw error;
    }
  }
}

export default new ApplicationService();
