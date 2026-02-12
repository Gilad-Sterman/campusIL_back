import { supabase } from '../config/db.js';

class SearchService {
  // =============================================
  // APPLICATION HUB SEARCH
  // =============================================
  
  /**
   * Elastic-style search for Application Hub intro page
   * Searches across: name, degree_level, discipline, career_horizon, domain
   * Returns grouped results by discipline
   */
  async searchPrograms(query = '', options = {}) {
    try {
      const { limit = 50 } = options;
      
      let dbQuery = supabase
        .from('programs')
        .select(`
          id,
          name,
          degree_level,
          field,
          discipline,
          domain,
          career_horizon,
          short_description,
          university_id,
          university:universities(id, name, city, logo_url)
        `)
        .eq('status', 'active');

      // Apply full-text search if query provided
      if (query && query.trim()) {
        const searchTerm = query.trim();
        
        // Use OR condition for searching across multiple fields
        dbQuery = dbQuery.or(`name.ilike.%${searchTerm}%,degree_level.ilike.%${searchTerm}%,discipline.ilike.%${searchTerm}%,career_horizon.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%,field.ilike.%${searchTerm}%`);
      }

      dbQuery = dbQuery
        .order('name')
        .limit(limit);

      const { data, error } = await dbQuery;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      // Group results by discipline
      const groupedResults = this.groupByDiscipline(data);

      return {
        query,
        total: data.length,
        grouped_results: groupedResults,
        raw_results: data
      };
    } catch (error) {
      console.error('SearchService.searchPrograms error:', error);
      throw error;
    }
  }

  /**
   * Search programs within a specific domain
   * Used for domain pages (/domains/{domain-name})
   */
  async searchProgramsByDomain(domain, query = '', options = {}) {
    try {
      const { limit = 50 } = options;
      
      let dbQuery = supabase
        .from('programs')
        .select(`
          id,
          name,
          degree_level,
          field,
          discipline,
          domain,
          career_horizon,
          short_description,
          university_id,
          university:universities(id, name, city, logo_url)
        `)
        .eq('status', 'active')
        .eq('domain', domain);

      // Apply search within domain if query provided
      if (query && query.trim()) {
        const searchTerm = query.trim();
        
        dbQuery = dbQuery.or(`name.ilike.%${searchTerm}%,degree_level.ilike.%${searchTerm}%,discipline.ilike.%${searchTerm}%,career_horizon.ilike.%${searchTerm}%,field.ilike.%${searchTerm}%`);
      }

      dbQuery = dbQuery
        .order('name')
        .limit(limit);

      const { data, error } = await dbQuery;

      if (error) {
        throw new Error(`Domain search failed: ${error.message}`);
      }

      // Group by university for domain pages
      const groupedByUniversity = this.groupByUniversity(data);

      return {
        domain,
        query,
        total: data.length,
        universities: groupedByUniversity,
        raw_results: data
      };
    } catch (error) {
      console.error('SearchService.searchProgramsByDomain error:', error);
      throw error;
    }
  }

  /**
   * Get program details for "More Information" functionality
   */
  async getProgramDetails(programId) {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          id,
          name,
          degree_level,
          field,
          discipline,
          domain,
          career_horizon,
          short_description,
          description,
          duration_years,
          duration_text,
          tuition_usd,
          requirements,
          application_url,
          image_url,
          university:universities(
            id, 
            name, 
            city, 
            region, 
            logo_url, 
            application_url,
            description
          )
        `)
        .eq('id', programId)
        .eq('status', 'active')
        .single();

      if (error) {
        throw new Error(`Failed to get program details: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('SearchService.getProgramDetails error:', error);
      throw error;
    }
  }

  /**
   * Get all available domains with program counts
   */
  async getDomains() {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('domain')
        .eq('status', 'active')
        .not('domain', 'is', null);

      if (error) {
        throw new Error(`Failed to get domains: ${error.message}`);
      }

      // Count programs per domain
      const domainCounts = data.reduce((acc, program) => {
        acc[program.domain] = (acc[program.domain] || 0) + 1;
        return acc;
      }, {});

      // Convert to array with counts
      const domains = Object.entries(domainCounts).map(([name, count]) => ({
        name,
        program_count: count
      }));

      return domains.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('SearchService.getDomains error:', error);
      throw error;
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  /**
   * Group programs by discipline for intro page display
   */
  groupByDiscipline(programs) {
    const grouped = programs.reduce((acc, program) => {
      const discipline = program.discipline || 'Other';
      if (!acc[discipline]) {
        acc[discipline] = [];
      }
      acc[discipline].push(program);
      return acc;
    }, {});

    // Convert to array format expected by frontend
    return Object.entries(grouped).map(([discipline, programs]) => ({
      discipline,
      programs: programs.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.discipline.localeCompare(b.discipline));
  }

  /**
   * Group programs by university for domain pages
   */
  groupByUniversity(programs) {
    const grouped = programs.reduce((acc, program) => {
      const universityId = program.university.id;
      if (!acc[universityId]) {
        acc[universityId] = {
          university: program.university,
          programs: []
        };
      }
      acc[universityId].programs.push(program);
      return acc;
    }, {});

    // Convert to array and sort
    return Object.values(grouped).map(group => ({
      ...group,
      programs: group.programs.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.university.name.localeCompare(b.university.name));
  }
}

export default new SearchService();
