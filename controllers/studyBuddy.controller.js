import studyBuddyService from '../services/studyBuddy.service.js';

/**
 * Study Buddy controller for user-facing Discord community features
 */
class StudyBuddyController {
    
    /**
     * Get Discord invite link for authenticated user
     * GET /api/study-buddy/discord-link
     */
    async getDiscordLink(req, res) {
        try {
            const userId = req.user.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
            }

            const result = await studyBuddyService.getUserDiscordLink(userId);

            res.status(200).json({
                success: true,
                data: {
                    discordLink: result.discordLink,
                    hasLink: result.hasLink,
                    group: result.group,
                    message: result.message
                }
            });

        } catch (error) {
            console.error('StudyBuddyController.getDiscordLink error:', error);
            
            // Handle specific error cases
            if (error.message.includes('User not found')) {
                return res.status(404).json({
                    success: false,
                    error: 'User profile not found'
                });
            }

            if (error.message.includes('Quiz not completed') || error.message.includes('Failed to fetch quiz data')) {
                return res.status(200).json({
                    success: true,
                    data: {
                        discordLink: null,
                        hasLink: false,
                        group: null,
                        requiresQuiz: true,
                        message: 'Please complete your quiz first to join the appropriate study group'
                    }
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to get Discord link',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get user's group assignment info (for debugging/admin)
     * GET /api/study-buddy/group-info
     */
    async getGroupInfo(req, res) {
        try {
            const userId = req.user.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
            }

            const result = await studyBuddyService.getUserDiscordLink(userId);

            res.status(200).json({
                success: true,
                data: {
                    group: result.group,
                    hasLink: result.hasLink,
                    message: result.message,
                    debug: {
                        source: result.group?.source,
                        userId: userId
                    }
                }
            });

        } catch (error) {
            console.error('StudyBuddyController.getGroupInfo error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get group info',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default new StudyBuddyController();
