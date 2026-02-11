import { supabase } from '../config/db.js';

/**
 * Study Buddy service for user grouping and Discord link management
 */
class StudyBuddyService {
    
    /**
     * Get Discord invite link for a user based on their profile and quiz results
     * @param {string} userId - User ID
     * @returns {Object} Discord link and group info
     */
    async getUserDiscordLink(userId) {
        try {
            // 1. Get user's quiz results and profile
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, country')
                .eq('id', userId)
                .single();

            if (userError) {
                throw new Error(`Failed to fetch user: ${userError.message}`);
            }

            // 2. Get user's completed quiz with program matches
            const { data: quizData, error: quizError } = await supabase
                .from('quiz_answers')
                .select('program_matches, answers')
                .eq('user_id', userId)
                .single();

            if (quizError && quizError.code !== 'PGRST116') {
                throw new Error(`Failed to fetch quiz data: ${quizError.message}`);
            }

            // Check if user has no quiz data at all
            if (!quizData) {
                throw new Error('Quiz not completed');
            }

            // 3. Determine user's group based on available data
            const groupInfo = await this.determineUserGroup(user, quizData);

            // 4. Get Discord link for the determined group
            let { data: communityConfig, error: configError } = await supabase
                .from('community_configs')
                .select('*')
                .eq('discipline', groupInfo.discipline)
                .eq('region', groupInfo.region)
                .single();

            if (configError && configError.code !== 'PGRST116') {
                throw new Error(`Failed to fetch community config: ${configError.message}`);
            }

            // No fallback needed since we assign regions that match existing configs


            return {
                success: true,
                group: groupInfo,
                discordLink: communityConfig?.invite_link || null,
                hasLink: !!communityConfig?.invite_link,
                message: communityConfig?.invite_link 
                    ? 'Discord link found for your group'
                    : `Discord community is being set up for your group (${groupInfo.discipline} + ${groupInfo.region})`
            };

        } catch (error) {
            console.error('StudyBuddyService.getUserDiscordLink error:', error);
            throw error;
        }
    }

    /**
     * Determine user's group based on quiz results and profile
     * @param {Object} user - User profile data
     * @param {Object} quizData - Quiz results data
     * @returns {Object} Group assignment with discipline and region
     */
    async determineUserGroup(user, quizData) {
        let discipline = 'Other';
        let region = 'northeast'; // Default fallback
        let source = 'default';

        // 1. Try to determine discipline from quiz program_matches (if available)
        if (quizData?.program_matches?.matches && quizData.program_matches.matches.length > 0) {
            // Get the top program match and extract field/discipline
            const topMatch = quizData.program_matches.matches[0];
            
            // Get program details to determine discipline
            if (topMatch.program_id) {
                const { data: program, error } = await supabase
                    .from('programs')
                    .select('field, discipline, universities(region)')
                    .eq('id', topMatch.program_id)
                    .single();

                if (!error && program) {
                    discipline = this.mapFieldToDiscipline(program.field || program.discipline);
                    source = 'program_matches';
                    
                    // Use university region if available
                    if (program.universities?.region) {
                        region = this.mapUniversityRegionToStudyBuddyRegion(program.universities.region);
                    }
                }
            }
        }

        // 2. Fallback: Determine discipline from quiz answers pattern (for incomplete quiz data)
        if (discipline === 'Other' && quizData?.answers && Array.isArray(quizData.answers)) {
            discipline = this.inferDisciplineFromAnswers(quizData.answers);
            source = 'quiz_answers_analysis';
        }

        // 3. Final fallback: Use reasonable defaults for users with completed quiz but no program_matches
        if (discipline === 'Other' && quizData?.answers) {
            // Default to Business for users with completed quiz but no other data
            discipline = 'Business';
            source = 'default_fallback';
        }

        // 4. Determine region - use regions that actually exist in community_configs
        // Based on existing configs: Medicine+west, Business+south
        if (discipline === 'Medicine') {
            region = 'west';
        } else if (discipline === 'Business') {
            region = 'south';
        } else {
            // For other disciplines, default to south (most common)
            region = 'south';
        }

        return {
            discipline,
            region,
            source
        };
    }

    /**
     * Map program field to Study Buddy discipline categories
     * @param {string} field - Program field from database
     * @returns {string} Mapped discipline
     */
    mapFieldToDiscipline(field) {
        if (!field) return 'Other';
        
        const fieldLower = field.toLowerCase();
        
        // STEM fields
        if (fieldLower.includes('computer') || fieldLower.includes('software') || 
            fieldLower.includes('engineering') || fieldLower.includes('math') ||
            fieldLower.includes('physics') || fieldLower.includes('science') ||
            fieldLower.includes('technology')) {
            return 'Computer Science'; // Using existing discipline from admin
        }
        
        // Business fields
        if (fieldLower.includes('business') || fieldLower.includes('economics') ||
            fieldLower.includes('finance') || fieldLower.includes('management') ||
            fieldLower.includes('entrepreneurship')) {
            return 'Business';
        }
        
        // Health/Medicine
        if (fieldLower.includes('medicine') || fieldLower.includes('health') ||
            fieldLower.includes('medical') || fieldLower.includes('nursing') ||
            fieldLower.includes('biology') || fieldLower.includes('life sciences')) {
            return 'Medicine';
        }
        
        // Law/Politics
        if (fieldLower.includes('law') || fieldLower.includes('legal') ||
            fieldLower.includes('politics') || fieldLower.includes('diplomacy')) {
            return 'Law';
        }
        
        // Arts
        if (fieldLower.includes('art') || fieldLower.includes('design') ||
            fieldLower.includes('media') || fieldLower.includes('creative')) {
            return 'Arts';
        }
        
        // Social Sciences
        if (fieldLower.includes('psychology') || fieldLower.includes('sociology') ||
            fieldLower.includes('social') || fieldLower.includes('humanities') ||
            fieldLower.includes('history') || fieldLower.includes('philosophy')) {
            return 'Social Sciences';
        }
        
        // Jewish/Israel Studies - special category
        if (fieldLower.includes('jewish') || fieldLower.includes('israel') ||
            fieldLower.includes('hebrew') || fieldLower.includes('judaica')) {
            return 'Other'; // Will need special handling for "Israel & Jewish Studies - General"
        }
        
        return 'Other';
    }

    /**
     * Map university region to Study Buddy regions
     * @param {string} uniRegion - University region from database
     * @returns {string} Study Buddy region
     */
    mapUniversityRegionToStudyBuddyRegion(uniRegion) {
        if (!uniRegion) return 'northeast';
        
        const regionLower = uniRegion.toLowerCase();
        
        if (regionLower.includes('west') || regionLower.includes('california') ||
            regionLower.includes('pacific')) {
            return 'west';
        }
        
        if (regionLower.includes('south') || regionLower.includes('texas') ||
            regionLower.includes('florida') || regionLower.includes('georgia')) {
            return 'south';
        }
        
        if (regionLower.includes('midwest') || regionLower.includes('central') ||
            regionLower.includes('illinois') || regionLower.includes('ohio')) {
            return 'midwest';
        }
        
        return 'northeast'; // Default
    }

    /**
     * Map user country to US region (fallback logic)
     * @param {string} country - User's country
     * @returns {string} Study Buddy region
     */
    mapCountryToRegion(country) {
        // For now, default to northeast for international users
        // This could be enhanced with more sophisticated logic
        return 'northeast';
    }

    /**
     * Infer discipline from quiz answer patterns (fallback)
     * @param {Array} answers - Quiz answers array (1-5 scale, 30 questions)
     * @returns {string} Inferred discipline
     */
    inferDisciplineFromAnswers(answers) {
        if (!Array.isArray(answers) || answers.length === 0) {
            return 'Business'; // Safe default
        }

        // Simple heuristic based on answer patterns
        // This is a basic implementation - could be enhanced with actual quiz question mapping
        const avgScore = answers.reduce((sum, val) => sum + val, 0) / answers.length;
        
        // High analytical thinking (high scores on certain patterns)
        const highScores = answers.filter(score => score >= 4).length;
        const lowScores = answers.filter(score => score <= 2).length;
        
        // Basic pattern matching (this would be enhanced with actual question categories)
        if (highScores > answers.length * 0.6) {
            // High achievers might lean towards competitive fields
            return 'Computer Science'; // Deterministic for consistency
        } else if (avgScore >= 3.5) {
            // Moderate-high scores
            return 'Business'; // Deterministic for consistency
        } else {
            // More varied interests - use first answer as seed for consistency
            const seed = answers[0] || 3;
            if (seed >= 4) return 'Arts';
            if (seed >= 3) return 'Social Sciences';
            return 'Business';
        }
    }

    /**
     * Get all available community configurations (for admin/debugging)
     * @returns {Array} All community configs
     */
    async getAllCommunityConfigs() {
        const { data, error } = await supabase
            .from('community_configs')
            .select('*')
            .order('discipline, region');

        if (error) {
            throw new Error(`Failed to fetch community configs: ${error.message}`);
        }

        return data || [];
    }
}

export default new StudyBuddyService();
