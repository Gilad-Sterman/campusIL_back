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
    
    // RIASEC activity questions (Q65-Q67 from full quiz - nested rating questions)
    riasec: {
      realistic: [
        { questionId: 65, activityId: 'activity_1' },  // Build kitchen cabinets
        { questionId: 65, activityId: 'activity_7' },  // Repair household appliances
        { questionId: 66, activityId: 'activity_13' }, // Assemble electronic parts
        { questionId: 66, activityId: 'activity_19' }, // Drive a truck to deliver packages
        { questionId: 67, activityId: 'activity_25' }  // Test the quality of parts before shipment
      ],
      investigative: [
        { questionId: 65, activityId: 'activity_2' },  // Develop a new medicine
        { questionId: 65, activityId: 'activity_8' },  // Study ways to reduce water pollution
        { questionId: 66, activityId: 'activity_14' }, // Conduct chemical experiments
        { questionId: 66, activityId: 'activity_20' }, // Examine blood samples using a microscope
        { questionId: 67, activityId: 'activity_26' }  // Develop a way to better predict the weather
      ],
      artistic: [
        { questionId: 65, activityId: 'activity_3' },  // Write books or plays
        { questionId: 65, activityId: 'activity_9' },  // Compose or arrange music
        { questionId: 66, activityId: 'activity_15' }, // Create special effects for movies
        { questionId: 67, activityId: 'activity_21' }, // Paint sets for plays
        { questionId: 67, activityId: 'activity_27' }  // Write scripts for movies or television shows
      ],
      social: [
        { questionId: 65, activityId: 'activity_4' },  // Help people with personal or emotional problems
        { questionId: 65, activityId: 'activity_10' }, // Give career guidance to people
        { questionId: 66, activityId: 'activity_16' }, // Perform rehabilitation therapy
        { questionId: 67, activityId: 'activity_22' }, // Do volunteer work at a non-profit organization
        { questionId: 67, activityId: 'activity_28' }  // Teach a high-school class
      ],
      enterprising: [
        { questionId: 65, activityId: 'activity_5' },  // Manage a department within a large company
        { questionId: 66, activityId: 'activity_11' }, // Start your own business
        { questionId: 66, activityId: 'activity_17' }, // Negotiate business contracts
        { questionId: 67, activityId: 'activity_23' }, // Market a new line of clothing
        { questionId: 67, activityId: 'activity_29' }  // Sell merchandise at a department store
      ],
      conventional: [
        { questionId: 65, activityId: 'activity_6' },  // Install software across computers on a large network
        { questionId: 66, activityId: 'activity_12' }, // Operate a calculator
        { questionId: 66, activityId: 'activity_18' }, // Keep shipping and receiving records
        { questionId: 67, activityId: 'activity_24' }, // Inventory supplies using a hand-held computer
        { questionId: 67, activityId: 'activity_30' }  // Stamp, sort, and distribute mail for an organization
      ]
    },
    
    // Big 5 Openness questions (Q35-Q58 from full quiz)
    openness: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62]
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
