export const QUIZ_SCORING_CONTRACT_VERSION = 'v1';
export const QUIZ_SCORING_MODEL_VERSION = 'v1.0';

export const QUIZ_SCORING_CONFIG = {
  sectionWeights: {
    base: {
      degree: 40,
      campus: 15,
      city: 15
    },
    adaptivePool: 30,
    // V3 specific weights
    v3: {
      base: { academic: 0.70, environment: 0.30 },
      shifts: {
        PRIORITY_ACADEMIC: { academic: 0.00, environment: 0.00 },
        PRIORITY_CAREER: { academic: 0.10, environment: -0.10 },
        PRIORITY_SOCIAL: { academic: -0.10, environment: 0.10 }
      }
    }
  },
  traits: {
    riasec: ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'],
    bigFive: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  },
  
  // Question mapping for different quiz versions
  questionMapping: {
    sectionWeights: { key: 5, type: 'constraint_slider' },
    
    // V1 mapping (Full Quiz)
    v1: {
      conscientiousness: [
        { key: 14, reverse: false }, { key: 15, reverse: false }, { key: 16, reverse: false },
        { key: 17, reverse: false }, { key: 18, reverse: false }, { key: 19, reverse: true },
        { key: 20, reverse: true }, { key: 21, reverse: true }, { key: 22, reverse: false },
        { key: 23, reverse: false }, { key: 24, reverse: true }, { key: 25, reverse: true },
        { key: 26, reverse: false }, { key: 27, reverse: false }, { key: 28, reverse: true },
        { key: 29, reverse: true }, { key: 30, reverse: false }, { key: 31, reverse: false },
        { key: 32, reverse: true }, { key: 33, reverse: true }, { key: 34, reverse: true },
        { key: 35, reverse: true }, { key: 36, reverse: true }, { key: 37, reverse: true }
      ],
      riasec: {
        realistic: [
          { questionId: 65, activityId: 'activity_1' }, { questionId: 65, activityId: 'activity_7' },
          { questionId: 66, activityId: 'activity_13' }, { questionId: 66, activityId: 'activity_19' },
          { questionId: 67, activityId: 'activity_25' }
        ],
        investigative: [
          { questionId: 65, activityId: 'activity_2' }, { questionId: 65, activityId: 'activity_8' },
          { questionId: 66, activityId: 'activity_14' }, { questionId: 66, activityId: 'activity_20' },
          { questionId: 67, activityId: 'activity_26' }
        ],
        artistic: [
          { questionId: 65, activityId: 'activity_3' }, { questionId: 65, activityId: 'activity_9' },
          { questionId: 66, activityId: 'activity_15' }, { questionId: 67, activityId: 'activity_21' },
          { questionId: 67, activityId: 'activity_27' }
        ],
        social: [
          { questionId: 65, activityId: 'activity_4' }, { questionId: 65, activityId: 'activity_10' },
          { questionId: 66, activityId: 'activity_16' }, { questionId: 67, activityId: 'activity_22' },
          { questionId: 67, activityId: 'activity_28' }
        ],
        enterprising: [
          { questionId: 65, activityId: 'activity_5' }, { questionId: 66, activityId: 'activity_11' },
          { questionId: 66, activityId: 'activity_17' }, { questionId: 67, activityId: 'activity_23' },
          { questionId: 67, activityId: 'activity_29' }
        ],
        conventional: [
          { questionId: 65, activityId: 'activity_6' }, { questionId: 66, activityId: 'activity_12' },
          { questionId: 66, activityId: 'activity_18' }, { questionId: 67, activityId: 'activity_24' },
          { questionId: 67, activityId: 'activity_30' }
        ]
      },
      openness: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62]
    },
    // V3 mapping (PathFinder V3)
    v3: {
      riasec: {
        realistic: [6, 12, 29, 45, 51],
        investigative: [7, 13, 30, 46, 52],
        artistic: [8, 25, 31, 47, 53],
        social: [9, 26, 42, 48, 54],
        enterprising: [10, 27, 43, 49, 55],
        conventional: [11, 28, 44, 50, 56]
      },
      openness: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
      priority: 59,
      campusFactors: 58,
      degreeLevel: 2,
      euclideanConstant: 9.798
    }
  },
  
  // Personality scoring thresholds (based on quiz specs)
  thresholds: {
    conscientiousness: { high: 4.0, low: 2.5 },
    openness: { high: 4.0, low: 2.5 }
  }
};

export const buildDefaultScoring = () => ({
  riasec: {
    realistic: null, investigative: null, artistic: null,
    social: null, enterprising: null, conventional: null
  },
  personality: {
    openness: { score: null, tag: null },
    conscientiousness: { score: null, tag: null },
    extraversion: null, agreeableness: null, neuroticism: null
  },
  sections: {
    degree: { score: null, weight: null },
    campus: { score: null, weight: null },
    city: { score: null, weight: null }
  },
  v3: {
    academic_fit: null,
    environment_fit: null,
    weights: { academic: 0.7, environment: 0.3 }
  }
});

