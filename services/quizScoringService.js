import {
  QUIZ_SCORING_CONFIG,
  QUIZ_SCORING_MODEL_VERSION,
  buildDefaultScoring
} from '../config/quizScoringConfig.js';

class QuizScoringService {
  calculateScoring(answerEntries = []) {
    const scoring = buildDefaultScoring();
    const sectionWeights = this._deriveSectionWeights(answerEntries);
    
    // Calculate personality scores
    const conscientiousnessScore = this._calculateConscientiousness(answerEntries);
    const opennessScore = this._calculateOpenness(answerEntries);
    
    // Calculate RIASEC scores (will be null for current 40-question quiz)
    const riasecScores = this._calculateRiasec(answerEntries);
    
    // Update scoring object
    scoring.sections = {
      degree: { score: null, weight: sectionWeights.degree },
      campus: { score: null, weight: sectionWeights.campus },
      city: { score: null, weight: sectionWeights.city }
    };
    
    scoring.personality.conscientiousness = conscientiousnessScore;
    scoring.personality.openness = opennessScore;
    scoring.riasec = riasecScores;

    return {
      scoring,
      modelVersion: QUIZ_SCORING_MODEL_VERSION,
      diagnostics: {
        missingFormulaDefinitions: false,
        completedMetrics: {
          sectionWeights: true,
          riasec: riasecScores.realistic !== null,
          bigFive: conscientiousnessScore.score !== null,
          ranking: false // Still false until program matching implemented
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
    const sliderEntry = answerEntries.find((entry) => entry?.questionId === 5);
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
  
  /**
   * Calculate Big 5 Conscientiousness score from quiz answers
   * Based on lines 915-981 in quiz specs
   */
  _calculateConscientiousness(answerEntries) {
    const questionMap = QUIZ_SCORING_CONFIG.questionMapping.conscientiousness;
    
    if (!questionMap || questionMap.length === 0) {
      return { score: null, tag: null };
    }
    
    const answerMap = this._buildAnswerMap(answerEntries);
    const scores = [];
    
    questionMap.forEach(({ key, reverse }) => {
      const answer = answerMap[key];
      if (answer !== undefined && answer !== null) {
        let score = Number(answer);
        if (Number.isFinite(score) && score >= 1 && score <= 5) {
          // Apply reverse scoring if needed
          if (reverse) {
            score = 6 - score; // Reverse 1-5 scale
          }
          scores.push(score);
        }
      }
    });
    
    if (scores.length === 0) {
      return { score: null, tag: null };
    }
    
    // Calculate average score
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const roundedScore = Math.round(avgScore * 10) / 10;
    
    // Generate personality tag based on thresholds
    const thresholds = QUIZ_SCORING_CONFIG.thresholds.conscientiousness;
    let tag;
    if (roundedScore >= thresholds.high) {
      tag = 'High';
    } else if (roundedScore <= thresholds.low) {
      tag = 'Low';
    } else {
      tag = 'Average';
    }
    
    return { score: roundedScore, tag };
  }
  
  /**
   * Calculate Big 5 Openness score from quiz answers
   * Will return null for current 40-question quiz (questions not available)
   */
  _calculateOpenness(answerEntries) {
    const questionMap = QUIZ_SCORING_CONFIG.questionMapping.openness;
    
    if (!questionMap || questionMap.length === 0) {
      return { score: null, tag: null };
    }
    
    // Implementation will be similar to conscientiousness when openness questions are added
    return { score: null, tag: null };
  }
  
  /**
   * Calculate RIASEC scores from quiz answers
   * Will return null values for current 40-question quiz (questions not available)
   */
  _calculateRiasec(answerEntries) {
    const riasecMap = QUIZ_SCORING_CONFIG.questionMapping.riasec;
    const scores = {
      realistic: null,
      investigative: null,
      artistic: null,
      social: null,
      enterprising: null,
      conventional: null
    };
    
    // Check if any RIASEC questions are available
    const hasRiasecQuestions = Object.values(riasecMap).some(questions => questions.length > 0);
    
    if (!hasRiasecQuestions) {
      return scores;
    }
    
    // Implementation will calculate RIASEC scores when questions are added for 80-question quiz
    return scores;
  }
  
  /**
   * Build a map of questionId -> answer for easy lookup
   */
  _buildAnswerMap(answerEntries) {
    const answerMap = {};
    answerEntries.forEach(entry => {
      if (entry && entry.questionId && entry.answer !== undefined) {
        answerMap[entry.questionId] = entry.answer;
      }
    });
    return answerMap;
  }
  
  /**
   * Generate brilliance summary based on personality scores
   * Based on quiz specs personality analysis
   */
  generateBrillianceSummary(scoring) {
    const { conscientiousness, openness } = scoring.personality;
    const sectionWeights = scoring.sections;
    
    let summary = "";
    const traits = [];
    
    // Analyze conscientiousness
    if (conscientiousness && conscientiousness.score !== null) {
      if (conscientiousness.tag === 'High') {
        summary += "You demonstrate high conscientiousness, showing strong organization, reliability, and goal-oriented behavior. ";
        traits.push('Organized', 'Reliable', 'Goal-oriented');
      } else if (conscientiousness.tag === 'Low') {
        summary += "You show a more flexible, spontaneous approach to tasks and planning. ";
        traits.push('Flexible', 'Spontaneous', 'Adaptable');
      } else {
        summary += "You balance structure with flexibility in your approach to tasks and goals. ";
        traits.push('Balanced', 'Practical', 'Adaptable');
      }
    }
    
    // Analyze section weights (academic focus)
    if (sectionWeights.degree && sectionWeights.degree.weight > 50) {
      summary += "Your strong academic focus suggests you thrive in intellectually challenging environments with clear learning outcomes.";
      if (!traits.includes('Academic-focused')) traits.push('Academic-focused');
    } else if (sectionWeights.campus && sectionWeights.campus.weight > 35) {
      summary += "Your emphasis on campus life indicates you value community, social connections, and the full university experience.";
      if (!traits.includes('Community-oriented')) traits.push('Community-oriented');
    } else if (sectionWeights.city && sectionWeights.city.weight > 35) {
      summary += "Your focus on city environment shows you value location, lifestyle, and the broader cultural context of your studies.";
      if (!traits.includes('Lifestyle-conscious')) traits.push('Lifestyle-conscious');
    }
    
    // Default summary if no specific patterns detected
    if (!summary) {
      summary = "Your quiz responses show a thoughtful approach to educational decisions, balancing multiple important factors.";
      traits.push('Thoughtful', 'Balanced', 'Decisive');
    }
    
    return {
      summary: summary.trim(),
      traits: traits.slice(0, 3) // Limit to top 3 traits
    };
  }
}

const quizScoringService = new QuizScoringService();

export default quizScoringService;
