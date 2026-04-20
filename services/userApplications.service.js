import { supabaseAdmin } from '../config/db.js';

/**
 * MVP "My Applications" — backed by public.user_applications.
 * Uses service role with explicit user_id checks (matches admin-style access).
 */
class UserApplicationsService {
  /**
   * @param {string} userId
   * @param {{ program_id: string, university_id: string }} payload
   */
  async create(userId, { program_id, university_id }) {
    if (!program_id || !university_id) {
      const err = new Error('program_id and university_id are required');
      err.statusCode = 400;
      throw err;
    }

    const { data: program, error: programError } = await supabaseAdmin
      .from('programs')
      .select('id, university_id, status')
      .eq('id', program_id)
      .single();

    if (programError || !program) {
      const err = new Error('Program not found');
      err.statusCode = 404;
      throw err;
    }

    if (program.university_id !== university_id) {
      const err = new Error('University does not match the selected program');
      err.statusCode = 400;
      throw err;
    }

    const { data, error } = await supabaseAdmin
      .from('user_applications')
      .insert([
        {
          user_id: userId,
          program_id,
          university_id,
          status: 'saved'
        }
      ])
      .select(
        `
        id,
        user_id,
        program_id,
        university_id,
        status,
        external_link,
        created_at,
        updated_at,
        program:programs(
          id,
          name,
          degree_level,
          application_url,
          status,
          image_url
        ),
        university:universities(
          id,
          name,
          city,
          logo_url,
          website_url,
          application_url
        )
      `
      )
      .single();

    if (error) {
      if (error.code === '23505') {
        const dup = new Error('Already in your applications');
        dup.statusCode = 409;
        throw dup;
      }
      throw new Error(error.message);
    }

    return this._enrichRow(data);
  }

  /**
   * @param {string} userId
   */
  async listByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_applications')
      .select(
        `
        id,
        user_id,
        program_id,
        university_id,
        status,
        external_link,
        created_at,
        updated_at,
        program:programs(
          id,
          name,
          degree_level,
          application_url,
          status,
          image_url
        ),
        university:universities(
          id,
          name,
          city,
          logo_url,
          website_url,
          application_url
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user applications: ${error.message}`);
    }

    return (data || []).map((row) => this._enrichRow(row));
  }

  /**
   * @param {string} id
   * @param {string} userId
   * @param {{ status?: string, external_link?: string | null }} patch
   */
  async updateById(id, userId, patch) {
    const clean = {};

    if (patch.status !== undefined) {
      if (patch.status !== 'saved' && patch.status !== 'applied') {
        const err = new Error('status must be saved or applied');
        err.statusCode = 400;
        throw err;
      }
      clean.status = patch.status;
    }

    if (patch.external_link !== undefined) {
      const v = patch.external_link;
      clean.external_link =
        v === null || v === '' ? null : String(v).trim();
    }

    if (Object.keys(clean).length === 0) {
      const err = new Error('No valid fields to update');
      err.statusCode = 400;
      throw err;
    }

    clean.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('user_applications')
      .update(clean)
      .eq('id', id)
      .eq('user_id', userId)
      .select(
        `
        id,
        user_id,
        program_id,
        university_id,
        status,
        external_link,
        created_at,
        updated_at,
        program:programs(
          id,
          name,
          degree_level,
          application_url,
          status,
          image_url
        ),
        university:universities(
          id,
          name,
          city,
          logo_url,
          website_url,
          application_url
        )
      `
      )
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const err = new Error('User application not found');
        err.statusCode = 404;
        throw err;
      }
      throw new Error(error.message);
    }

    return this._enrichRow(data);
  }

  /**
   * Flags inactive/removed programs for client copy ("Program no longer available").
   * @private
   */
  _enrichRow(row) {
    if (!row) return row;
    const programStatus = row.program?.status;
    const programUnavailable =
      !row.program || programStatus === 'inactive';
    return {
      ...row,
      program_unavailable: Boolean(programUnavailable)
    };
  }
}

export default new UserApplicationsService();
