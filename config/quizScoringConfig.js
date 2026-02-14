export const QUIZ_SCORING_CONTRACT_VERSION = 'v1';
export const QUIZ_SCORING_MODEL_VERSION = 'draft-0';

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
  bigFive: {
    openness: null,
    conscientiousness: null,
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
