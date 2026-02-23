import programMatchingService from '../services/programMatchingService.js';

/**
 * Program Matching Controller
 * Handles API endpoints for program matching functionality
 */

/**
 * Match programs for a student based on their quiz results
 * POST /api/programs/match
 */
export const matchPrograms = async (req, res) => {
  try {
    const { studentProfile } = req.body;
    
    if (!studentProfile) {
      return res.status(400).json({
        success: false,
        error: 'Student profile is required'
      });
    }
    
    // Call the matching service
    const matchResults = await programMatchingService.matchPrograms(studentProfile);
    
    if (!matchResults.success) {
      return res.status(500).json(matchResults);
    }
    
    res.json(matchResults);
    
  } catch (error) {
    console.error('Program matching controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during program matching'
    });
  }
};

/**
 * Get program matching test data for development
 * GET /api/programs/match/test
 */
export const getMatchingTestData = async (req, res) => {
  try {
    // Sample student profile for testing
    const sampleStudentProfile = {
      riasec_scores: {
        realistic: 2.1,
        investigative: 4.2,
        artistic: 1.8,
        social: 3.5,
        enterprising: 3.0,
        conventional: 2.4
      },
      personality_scores: {
        conscientiousness: { score: 4.1, tag: 'High' },
        openness: { score: 3.7, tag: 'Average' }
      },
      section_weights: {
        degree: { weight: 52 },
        campus: { weight: 27 },
        city: { weight: 21 }
      }
    };
    
    const matchResults = await programMatchingService.matchPrograms(sampleStudentProfile);
    
    res.json({
      success: true,
      sample_student_profile: sampleStudentProfile,
      match_results: matchResults
    });
    
  } catch (error) {
    console.error('Test matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate test matching data'
    });
  }
};
