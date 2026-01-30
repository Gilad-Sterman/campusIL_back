import { supabase, supabaseAdmin } from '../config/db.js';

class AdminService {
    // =============================================
    // DASHBOARD ANALYTICS
    // =============================================
    async getDashboardStats(startDate, endDate) {
        // Build date filter if provided
        const dateFilter = startDate && endDate
            ? { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() }
            : null;

        // Helper to apply date filter
        const applyDateFilter = (query, info = { column: 'created_at' }) => {
            if (dateFilter) {
                return query.gte(info.column, dateFilter.start).lte(info.column, dateFilter.end);
            }
            return query;
        };

        // Get quiz stats
        // quiz_progress (active/in-progress)
        let quizStartsQuery = supabase
            .from('quiz_progress')
            .select('*', { count: 'exact', head: true });
        quizStartsQuery = applyDateFilter(quizStartsQuery, { column: 'started_at' });
        const { count: quizStarts } = await quizStartsQuery;

        // quiz_answers (completed)
        let quizCompletionsQuery = supabaseAdmin
            .from('quiz_answers')
            .select('*', { count: 'exact', head: true });
        quizCompletionsQuery = applyDateFilter(quizCompletionsQuery, { column: 'completed_at' });
        const { count: quizCompletions } = await quizCompletionsQuery;

        // Get application stats
        let applicationsQuery = supabaseAdmin
            .from('applications')
            .select('*', { count: 'exact', head: true });
        applicationsQuery = applyDateFilter(applicationsQuery);
        const { count: totalApplications } = await applicationsQuery;

        // Get user count
        let usersQuery = supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true });
        usersQuery = applyDateFilter(usersQuery);
        const { count: totalUsers } = await usersQuery;

        // Get documents stats (metrics usually need distinct users for avg)
        // For avg docs per user, we consider ALL docs to get a general ratio, or filtered by date?
        // Usually stats like "Avg Docs/User" are "All Time" metrics or "Active" metrics.
        // Let's filter by uploaded_at if date range exists.
        let docsQuery = supabaseAdmin
            .from('documents')
            .select('user_id');
        docsQuery = applyDateFilter(docsQuery, { column: 'uploaded_at' });
        const { data: docsData } = await docsQuery;

        const avgDocsPerUser = docsData && docsData.length > 0
            ? docsData.length / new Set(docsData.map(d => d.user_id)).size
            : 0;

        // Top 5 universities by program count (placeholder for page views)
        // This is static config data, usually not date filtered, but usage data would be.
        // Keeping as is for now as it's 'top universities by program count' which is static.
        const { data: topUniversities } = await supabaseAdmin
            .from('programs')
            .select('university_id, universities(name)')
            .limit(100);

        const uniCounts = {};
        topUniversities?.forEach(p => {
            const name = p.universities?.name || 'Unknown';
            uniCounts[name] = (uniCounts[name] || 0) + 1;
        });
        const top5Universities = Object.entries(uniCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return {
            quizStarts: quizStarts || 0,
            quizCompletions: quizCompletions || 0,
            quizConversionRate: quizCompletions && totalApplications
                ? ((totalApplications / quizCompletions) * 100).toFixed(1)
                : 0,
            totalUsers: totalUsers || 0,
            totalApplications: totalApplications || 0,
            avgDocsPerUser: avgDocsPerUser.toFixed(1),
            top5Universities
        };
    }

    // =============================================
    // USER MANAGEMENT
    // =============================================
    async getUsers({ page = 1, limit = 20, search = '', status = '' }) {
        let query = supabaseAdmin
            .from('users')
            .select(`
        id, email, first_name, last_name, phone, country, role, status, created_at, updated_at,
        quiz_answers(id),
        applications(id, status)
      `, { count: 'exact' });

        if (search) {
            query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

        const { data, count, error } = await query;

        if (error) throw new Error(`Failed to fetch users: ${error.message}`);

        // Transform data
        const users = data.map(user => ({
            ...user,
            quizStatus: user.quiz_answers?.length > 0 ? 'completed' : 'not_started',
            applicationCount: user.applications?.length || 0
        }));

        return { users, total: count, page, limit };
    }

    async updateUserStatus(userId, newStatus, adminId) {
        // Check if user is super admin
        const { data: targetUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (fetchError) throw new Error('User not found');

        // Prevent blocking super admins (role = admin is treated as super admin for now)
        if (targetUser.role === 'admin' && newStatus === 'blocked') {
            throw new Error('Cannot block admin users');
        }

        // Update user status
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update user status: ${error.message}`);

        // Log action
        await this.createAuditLog({
            userId: adminId,
            action: newStatus === 'blocked' ? 'block_user' : 'unblock_user',
            resourceType: 'user',
            resourceId: userId,
            newValues: { status: newStatus }
        });

        return data;
    }

    async updateUserRole(userId, newRole, adminId) {
        // Validate role
        if (!['student', 'admin'].includes(newRole)) {
            throw new Error('Invalid role. Must be "student" or "admin"');
        }

        // Get current user data
        const { data: currentUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !currentUser) {
            throw new Error('User not found');
        }

        // Don't allow demoting yourself
        if (userId === adminId && newRole === 'student') {
            throw new Error('Cannot demote yourself from admin');
        }

        // Update user role
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update user role: ${error.message}`);
        }

        // Log the action
        await this.createAuditLog({
            userId: adminId,
            action: newRole === 'admin' ? 'promote_to_admin' : 'demote_from_admin',
            resourceType: 'user',
            resourceId: userId,
            oldValues: { role: currentUser.role },
            newValues: { role: newRole }
        });

        return data;
    }

    // =============================================
    // UNIVERSITIES MANAGEMENT
    // =============================================
    async getUniversities({ page = 1, limit = 20, search = '', status = '' }) {
        let query = supabaseAdmin
            .from('universities')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1).order('name');

        const { data, count, error } = await query;
        if (error) throw new Error(`Failed to fetch universities: ${error.message}`);

        return { universities: data, total: count, page, limit };
    }

    async createUniversity(universityData) {
        const { data, error } = await supabaseAdmin
            .from('universities')
            .insert(universityData)
            .select()
            .single();

        if (error) throw new Error(`Failed to create university: ${error.message}`);
        return data;
    }

    async updateUniversity(id, updateData) {
        const { data, error } = await supabaseAdmin
            .from('universities')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update university: ${error.message}`);
        return data;
    }

    async deleteUniversity(id) {
        // Check if programs are attached
        const { count } = await supabaseAdmin
            .from('programs')
            .select('*', { count: 'exact', head: true })
            .eq('university_id', id);

        if (count > 0) {
            throw new Error('Cannot delete university with attached programs');
        }

        const { error } = await supabaseAdmin
            .from('universities')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete university: ${error.message}`);
        return { success: true };
    }

    // =============================================
    // PROGRAMS MANAGEMENT
    // =============================================
    async getPrograms({ page = 1, limit = 20, search = '', universityId = '', discipline = '', status = '' }) {
        let query = supabaseAdmin
            .from('programs')
            .select('*, universities(name, city, region)', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%`);
        }
        if (universityId) {
            query = query.eq('university_id', universityId);
        }
        if (discipline) {
            query = query.eq('discipline', discipline);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1).order('name');

        const { data, count, error } = await query;
        if (error) throw new Error(`Failed to fetch programs: ${error.message}`);

        return { programs: data, total: count, page, limit };
    }

    async createProgram(programData) {
        const { data, error } = await supabaseAdmin
            .from('programs')
            .insert(programData)
            .select()
            .single();

        if (error) throw new Error(`Failed to create program: ${error.message}`);
        return data;
    }

    async updateProgram(id, updateData) {
        const { data, error } = await supabaseAdmin
            .from('programs')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update program: ${error.message}`);
        return data;
    }

    async deleteProgram(id) {
        const { error } = await supabaseAdmin
            .from('programs')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete program: ${error.message}`);
        return { success: true };
    }

    async bulkImportPrograms(programsArray) {
        const results = { created: 0, errors: [] };

        for (const program of programsArray) {
            try {
                // Find university by name
                const { data: uni } = await supabaseAdmin
                    .from('universities')
                    .select('id')
                    .ilike('name', program.universityName)
                    .single();

                if (!uni) {
                    results.errors.push({ row: program, error: 'University not found' });
                    continue;
                }

                await this.createProgram({
                    ...program,
                    university_id: uni.id
                });
                results.created++;
            } catch (err) {
                results.errors.push({ row: program, error: err.message });
            }
        }

        return results;
    }

    // =============================================
    // COMMUNITY GROUPS
    // =============================================
    async getCommunityConfigs() {
        const { data, error } = await supabaseAdmin
            .from('community_configs')
            .select('*')
            .order('discipline');

        if (error) throw new Error(`Failed to fetch community configs: ${error.message}`);
        return data || [];
    }

    async upsertCommunityConfig(configData) {
        const { data, error } = await supabaseAdmin
            .from('community_configs')
            .upsert(configData, { onConflict: 'discipline,region' })
            .select()
            .single();

        if (error) throw new Error(`Failed to save community config: ${error.message}`);
        return data;
    }

    async deleteCommunityConfig(id) {
        const { error } = await supabaseAdmin
            .from('community_configs')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete community config: ${error.message}`);
        return { success: true };
    }

    // =============================================
    // AUDIT LOGS
    // =============================================
    async createAuditLog({ userId, action, resourceType, resourceId, oldValues = null, newValues = null }) {
        const { error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                old_values: oldValues,
                new_values: newValues
            });

        if (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    async getAuditLogs({ page = 1, limit = 50, action = '', userId = '' }) {
        let query = supabaseAdmin
            .from('audit_logs')
            .select('*, users(email, first_name, last_name)', { count: 'exact' });

        if (action) {
            query = query.eq('action', action);
        }
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

        const { data, count, error } = await query;
        if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);

        return { logs: data, total: count, page, limit };
    }
}

export default new AdminService();
