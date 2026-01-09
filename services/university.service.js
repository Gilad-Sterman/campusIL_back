import { supabase, supabaseAdmin } from '../config/db.js';

class UniversityService {
  // Get all universities
  async getAllUniversities() {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch universities: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('UniversityService.getAllUniversities error:', error);
      throw error;
    }
  }

  // Get university by ID
  async getUniversityById(id) {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('University not found');
        }
        throw new Error(`Failed to fetch university: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('UniversityService.getUniversityById error:', error);
      throw error;
    }
  }

  // Create new university (admin only)
  async createUniversity(universityData) {
    try {
      const { name, city, description, website_url, application_url, logo_url } = universityData;

      // Validate required fields
      if (!name || !city) {
        throw new Error('Name and city are required fields');
      }

      const { data, error } = await supabaseAdmin
        .from('universities')
        .insert([{
          name: name.trim(),
          city: city.trim(),
          description: description?.trim() || null,
          website_url: website_url?.trim() || null,
          application_url: application_url?.trim() || null,
          logo_url: logo_url?.trim() || null
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create university: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('UniversityService.createUniversity error:', error);
      throw error;
    }
  }

  // Update university (admin only)
  async updateUniversity(id, updateData) {
    try {
      // Remove undefined values and trim strings
      const cleanData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanData[key] = typeof updateData[key] === 'string' 
            ? updateData[key].trim() 
            : updateData[key];
        }
      });

      // Validate required fields if they're being updated
      if (cleanData.name && !cleanData.name) {
        throw new Error('Name cannot be empty');
      }
      if (cleanData.city && !cleanData.city) {
        throw new Error('City cannot be empty');
      }

      const { data, error } = await supabaseAdmin
        .from('universities')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('University not found');
        }
        throw new Error(`Failed to update university: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('UniversityService.updateUniversity error:', error);
      throw error;
    }
  }

  // Get universities with program count
  async getUniversitiesWithStats() {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          programs:programs(count)
        `)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch universities with stats: ${error.message}`);
      }

      // Transform the data to include program count
      const universitiesWithStats = data.map(university => ({
        ...university,
        program_count: university.programs?.[0]?.count || 0
      }));

      return universitiesWithStats;
    } catch (error) {
      console.error('UniversityService.getUniversitiesWithStats error:', error);
      throw error;
    }
  }
}

export default new UniversityService();
