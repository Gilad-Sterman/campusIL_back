export const QUIZ_SCORING_CONTRACT_VERSION = 'v1';
export const QUIZ_SCORING_MODEL_VERSION = 'v1.0';

export const QUIZ_SCORING_CONFIG = {
  sectionWeights: {
    base: {
      degree: 40,
      campus: 15,
      city: 15
    },
    adaptivePool: 30
  },
  traits: {
    riasec: ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'],
    bigFive: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  },
  
  // Question mapping for different quiz versions
  questionMapping: {
    sectionWeights: { key: 5, type: 'constraint_slider' },
    
    // Big 5 Conscientiousness questions (available in current 40-question quiz)
    // Mapping actual questionIds from database (14-37) to conscientiousness questions
    conscientiousness: [
      { key: 14, reverse: false }, // "I complete tasks successfully"
      { key: 15, reverse: false }, // "I excel in what I do"
      { key: 16, reverse: false }, // "I handle tasks smoothly"
      { key: 17, reverse: false }, // "I know how to get things done"
      { key: 18, reverse: false }, // "I like to tidy up"
      { key: 19, reverse: true },  // "I often forget to put things back"
      { key: 20, reverse: true },  // "I leave a mess in my room"
      { key: 21, reverse: true },  // "I leave my belongings around"
      { key: 22, reverse: false }, // "I keep my promises"
      { key: 23, reverse: false }, // "I tell the truth"
      { key: 24, reverse: true },  // "I break rules"
      { key: 25, reverse: true },  // "I break my promises"
      { key: 26, reverse: false }, // "I do more than what's expected"
      { key: 27, reverse: false }, // "I work hard"
      { key: 28, reverse: true },  // "I put little time and effort into my work"
      { key: 29, reverse: true },  // "I do just enough work to get by"
      { key: 30, reverse: false }, // "I am always prepared"
      { key: 31, reverse: false }, // "I carry out my plans"
      { key: 32, reverse: true },  // "I waste my time"
      { key: 33, reverse: true },  // "I have difficulty starting tasks"
      { key: 34, reverse: true },  // "I jump into things without thinking"
      { key: 35, reverse: true },  // "I make rash decisions"
      { key: 36, reverse: true },  // "I rush into things"
      { key: 37, reverse: true }   // "I act without thinking"
    ],
    
    // RIASEC questions (not available in current 40-question quiz, will be added for 80-question version)
    riasec: {
      realistic: [],
      investigative: [],
      artistic: [],
      social: [],
      enterprising: [],
      conventional: []
    },
    
    // Big 5 Openness questions (not available in current 40-question quiz)
    openness: []
  },
  
  // Personality scoring thresholds (based on quiz specs)
  thresholds: {
    conscientiousness: {
      high: 4.0,    // >= 4.0 = High
      low: 2.5      // <= 2.5 = Low, between = Average
    },
    openness: {
      high: 4.0,
      low: 2.5
    }
  }
};

export const buildDefaultScoring = () => ({
  riasec: {
    realistic: null,
    investigative: null,
    artistic: null,
    social: null,
    enterprising: null,
    conventional: null
  },
  personality: {
    openness: { score: null, tag: null },
    conscientiousness: { score: null, tag: null },
    extraversion: null,
    agreeableness: null,
    neuroticism: null
  },
  sections: {
    degree: { score: null, weight: null },
    campus: { score: null, weight: null },
    city: { score: null, weight: null }
  }
});
