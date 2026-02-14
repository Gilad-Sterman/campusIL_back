import {
  QUIZ_SCORING_CONFIG,
  QUIZ_SCORING_MODEL_VERSION,
  buildDefaultScoring
} from '../config/quizScoringConfig.js';

class QuizScoringService {
  calculateScoring(answerEntries = []) {
    const scoring = buildDefaultScoring();
    const sectionWeights = this._deriveSectionWeights(answerEntries);

    scoring.sections = {
      degree: { score: null, weight: sectionWeights.degree },
      campus: { score: null, weight: sectionWeights.campus },
      city: { score: null, weight: sectionWeights.city }
    };

    return {
      scoring,
      modelVersion: QUIZ_SCORING_MODEL_VERSION,
      diagnostics: {
        missingFormulaDefinitions: true,
        completedMetrics: {
          sectionWeights: true,
          riasec: false,
          bigFive: false,
          ranking: false
        }
      }
    };
  }

  calculateNumericAnswerAnalytics(answerEntries = []) {
    const numericValues = [];

    answerEntries.forEach((entry) => {
      const value = this._extractNumericValue(entry?.answer);
      if (Number.isFinite(value)) {
        numericValues.push(value);
      }
    });

    if (numericValues.length === 0) {
      return {
        numericCount: 0,
        numericAverage: null
      };
    }

    const average = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;

    return {
      numericCount: numericValues.length,
      numericAverage: Math.round(average * 10) / 10
    };
  }

  _deriveSectionWeights(answerEntries) {
    const fallback = QUIZ_SCORING_CONFIG.sectionWeights.base;
    const sliderEntry = answerEntries.find((entry) => entry?.questionId === 3);
    const sliderAnswer = sliderEntry?.answer;

    if (!sliderAnswer || typeof sliderAnswer !== 'object') {
      return fallback;
    }

    const degree = Number(sliderAnswer.degree);
    const campus = Number(sliderAnswer.campus);
    const city = Number(sliderAnswer.city);

    if (![degree, campus, city].every(Number.isFinite)) {
      return fallback;
    }

    const distributedTotal = degree + campus + city;
    if (distributedTotal <= 0) {
      return fallback;
    }

    const adaptivePool = QUIZ_SCORING_CONFIG.sectionWeights.adaptivePool;

    return {
      degree: fallback.degree + (adaptivePool * degree) / distributedTotal,
      campus: fallback.campus + (adaptivePool * campus) / distributedTotal,
      city: fallback.city + (adaptivePool * city) / distributedTotal
    };
  }

  _extractNumericValue(answer) {
    const primitiveValue = Number(answer);
    if (Number.isFinite(primitiveValue) && primitiveValue >= 0 && primitiveValue <= 5) {
      return primitiveValue;
    }

    if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
      const numericValues = Object.values(answer)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value >= 0 && value <= 5);

      if (numericValues.length > 0) {
        return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
      }
    }

    return null;
  }
}

const quizScoringService = new QuizScoringService();

export default quizScoringService;
