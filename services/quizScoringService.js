import {
  QUIZ_SCORING_CONFIG,
  QUIZ_SCORING_MODEL_VERSION,
  buildDefaultScoring
} from '../config/quizScoringConfig.js';

class QuizScoringService {
  calculateScoring(answerEntries = []) {
    // Detect version
    const version = this._detectVersion(answerEntries);
    
    if (version === 'v3') {
      return this._calculateV3Scoring(answerEntries);
    }

    const scoring = buildDefaultScoring();
    const sectionWeights = this._deriveSectionWeights(answerEntries);
    
    // Calculate personality scores
    const conscientiousnessScore = this._calculateConscientiousness(answerEntries, version);
    const opennessScore = this._calculateOpenness(answerEntries, version);
    
    // Calculate RIASEC scores (will be null for current 40-question quiz)
    const riasecScores = this._calculateRiasec(answerEntries, version);

    
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
      version: 'v1',
      scoring,
      modelVersion: QUIZ_SCORING_MODEL_VERSION,

      diagnostics: {
        missingFormulaDefinitions: false,
        completedMetrics: {
          sectionWeights: true,
          riasec: riasecScores.realistic !== null,
          bigFive: conscientiousnessScore.score !== null,
          ranking: false
        }
      }
    };
  }

  /**
   * Detect quiz version based on payload metadata or question signature
   */
  _detectVersion(answerEntries) {
    // Check for explicit version tag in metadata
    const versionTag = answerEntries.find(a => a.version);
    if (versionTag) return versionTag.version;

    // Check for V3-specific key footprint (guaranteed by updated frontend)
    const v3Keys = ['MEET_NAME', 'EXPLORE_WORK', 'EXPLORE_PERSONALITY', 'RIASEC_R_01'];
    const hasV3Keys = answerEntries.some(a => v3Keys.includes(a.key));
    
    if (hasV3Keys) {
      return 'v3';
    }
    
    return 'v1';
  }

  /**
   * Complete V3 Scoring Logic according to PathFinder V3 Spec
   */
  _calculateV3Scoring(answerEntries) {
    const scoring = buildDefaultScoring();
    const answerMap = this._buildAnswerMap(answerEntries);
    const v3Config = QUIZ_SCORING_CONFIG.questionMapping.v3;

    // 1. RIASEC Dimension Scores (Mean of 5 items per dimension)
    const riasecItems = [];
    const riasecScores = {};
    Object.keys(v3Config.riasec).forEach(dim => {
      const qIds = v3Config.riasec[dim];
      const values = qIds.map(id => answerMap[id]).filter(v => v !== undefined && v !== null);
      riasecScores[dim] = values.length > 0 ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2)) : 0;
      riasecItems.push(...values);
    });

    // 2. Openness Mapping (1 + raw_mean * 2)
    const opennessQIds = v3Config.openness;
    const opennessValues = opennessQIds.map(id => answerMap[id]).filter(v => v !== undefined && v !== null);
    const opennessRawMean = opennessValues.length > 0 ? (opennessValues.reduce((s, v) => s + v, 0) / opennessValues.length) : 1;
    const studentOpenness = Number((1 + (opennessRawMean * 2)).toFixed(2));

    // 3. Response Validity Checks
    const validity = this._runV3ValidityChecks(riasecItems, opennessValues);

    // 4. Weight Allocation (Q65)
    const priority = answerMap[v3Config.priority];
    const weightConfig = QUIZ_SCORING_CONFIG.sectionWeights.v3;
    const shift = weightConfig.shifts[priority] || { academic: 0, environment: 0 };
    const weights = {
      academic: weightConfig.base.academic + shift.academic,
      environment: weightConfig.base.environment + shift.environment
    };

    // 5. Structure final output
    scoring.riasec = riasecScores;
    scoring.personality.openness = { score: studentOpenness, tag: studentOpenness >= 4 ? 'High' : (studentOpenness <= 2 ? 'Low' : 'Average') };
    
    // Add sections to scoring for consistent DB storage
    scoring.sections = {
      academic: { weight: weights.academic },
      environment: { weight: weights.environment }
    };

    scoring.v3 = {
      student_openness: studentOpenness,
      student_priority: priority,
      weights,
      validity_check: validity
    };

    return {
      scoring,
      version: 'v3',
      modelVersion: '3.0',
      validity
    };
  }

  _runV3ValidityChecks(riasecItems, opennessValues) {
    const checks = {
      flat_riasec: false,
      near_flat_riasec: false,
      flat_openness: false,
      is_valid: true
    };

    // Check 1: Flat RIASEC (all 30 items same)
    if (riasecItems.length === 30 && new Set(riasecItems).size === 1) {
      checks.flat_riasec = true;
    }

    // Check 2: Near-flat RIASEC (SD < 0.5)
    if (riasecItems.length >= 20) {
      const mean = riasecItems.reduce((a, b) => a + b, 0) / riasecItems.length;
      const variance = riasecItems.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / riasecItems.length;
      const sd = Math.sqrt(variance);
      if (sd < 0.5) checks.near_flat_riasec = true;
    }

    // Check 3: Flat Openness (all 20 items same)
    if (opennessValues.length === 20 && new Set(opennessValues).size === 1) {
      checks.flat_openness = true;
    }

    checks.is_valid = !(checks.flat_riasec || checks.near_flat_riasec || checks.flat_openness);
    return checks;
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
  _calculateConscientiousness(answerEntries, version = 'v1') {
    const questionMap = QUIZ_SCORING_CONFIG.questionMapping[version]?.conscientiousness;

    
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
   * Uses questions Q35-Q58 (IDs 39-62 in full quiz)
   */
  _calculateOpenness(answerEntries, version = 'v1') {
    const questionMap = QUIZ_SCORING_CONFIG.questionMapping[version]?.openness;

    
    if (!questionMap || questionMap.length === 0) {
      return { score: null, tag: null };
    }
    
    const answerMap = this._buildAnswerMap(answerEntries);
    let totalScore = 0;
    let validAnswers = 0;
    
    // Calculate openness score using the mapped questions
    questionMap.forEach(questionId => {
      const answer = answerMap[questionId];
      if (answer !== undefined && answer !== null) {
        totalScore += Number(answer);
        validAnswers++;
      }
    });
    
    if (validAnswers === 0) {
      return { score: null, tag: null };
    }
    
    // Calculate average score (1-5 scale)
    const averageScore = Number((totalScore / validAnswers).toFixed(2));
    
    // Determine tag based on thresholds
    const thresholds = QUIZ_SCORING_CONFIG.thresholds.openness;
    let tag = 'Average';
    if (averageScore >= thresholds.high) {
      tag = 'High';
    } else if (averageScore <= thresholds.low) {
      tag = 'Low';
    }
    
    return { score: averageScore, tag };
  }
  
  /**
   * Calculate RIASEC scores from quiz answers
   * Handles nested activity rating questions (Q65-Q67)
   */
  _calculateRiasec(answerEntries, version = 'v1') {
    const riasecMap = QUIZ_SCORING_CONFIG.questionMapping[version]?.riasec;

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
    
    // Build answer map for easy lookup
    const answerMap = this._buildAnswerMap(answerEntries);
    
    // Calculate scores for each RIASEC category
    Object.keys(riasecMap).forEach(category => {
      const activities = riasecMap[category];
      if (activities.length === 0) {
        return;
      }
      
      let totalScore = 0;
      let validAnswers = 0;
      
      activities.forEach(({ questionId, activityId }) => {
        const questionAnswer = answerMap[questionId];
        if (questionAnswer && typeof questionAnswer === 'object' && questionAnswer[activityId] !== undefined) {
          totalScore += Number(questionAnswer[activityId]);
          validAnswers++;
        }
      });
      
      // Calculate average score for this category (0-4 scale)
      if (validAnswers > 0) {
        scores[category] = Number((totalScore / validAnswers).toFixed(2));
      }
    });
    
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
    const isV3 = !!scoring.v3;
    const { conscientiousness, openness } = scoring.personality;
    const riasec = scoring.riasec;
    
    let summary = "";
    const traits = [];
    
    // 1. Conscientiousness Analysis
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
    
    // 2. Openness Analysis
    if (openness && openness.score !== null) {
      if (openness.tag === 'High') {
        summary += "Your high openness indicates strong curiosity, creativity, and appreciation for new experiences. ";
        traits.push('Creative', 'Curious', 'Open-minded');
      } else if (openness.tag === 'Low') {
        summary += "You prefer familiar approaches and practical solutions over experimental ideas. ";
        traits.push('Practical', 'Traditional', 'Focused');
      } else {
        summary += "You show moderate openness, balancing curiosity with practical considerations. ";
        traits.push('Balanced', 'Thoughtful', 'Selective');
      }
    }
    
    // 3. RIASEC Interest Analysis
    if (riasec) {
      const riasecScores = Object.entries(riasec)
        .filter(([_, score]) => score !== null)
        .sort(([_, a], [__, b]) => Number(b) - Number(a))
        .slice(0, 2);
      
      if (riasecScores.length > 0) {
        const topInterest = riasecScores[0][0];
        const interestMap = {
          realistic: { trait: 'Hands-on Master', title: 'Hands-on Master', description: 'practical, technical, and hands-on environments' },
          investigative: { trait: 'Analytical Strategist', title: 'Analytical Strategist', description: 'scientific research and complex problem-solving' },
          artistic: { trait: 'Creative Visionary', title: 'Creative Visionary', description: 'original, expressive, and artistic pursuits' },
          social: { trait: 'People Connector', title: 'People Connector', description: 'helping, teaching, and supporting others' },
          enterprising: { trait: 'Dynamic Leader', title: 'Dynamic Leader', description: 'leadership, persuasion, and business growth' },
          conventional: { trait: 'System Architect', title: 'System Architect', description: 'structured, efficient, and detail-oriented systems' }
        };
        
        if (interestMap[topInterest]) {
          summary += `Professionally, you lean towards being a ${interestMap[topInterest].title}, thriving in ${interestMap[topInterest].description}. `;
          if (!traits.includes(interestMap[topInterest].trait)) {
            traits.push(interestMap[topInterest].trait);
          }
        }
      }
    }
    
    // 4. Weight Selection Analysis (V3 vs Legacy)
    if (isV3 && scoring.v3.weights) {
      const { academic, environment } = scoring.v3.weights;
      if (academic > 0.75) {
        summary += "Your profile emphasizes Academic Excellence, seeking rigorous programs that prioritize deep intellectual growth.";
        if (!traits.includes('Intellect-driven')) traits.push('Intellect-driven');
      } else if (environment > 0.35) {
        summary += "You place high value on the Campus Experience, looking for an environment that supports personal growth and community connection.";
        if (!traits.includes('Community-focused')) traits.push('Community-focused');
      }
    } else if (!isV3 && scoring.sections) {
      const sectionWeights = scoring.sections;
      if (sectionWeights.degree && sectionWeights.degree.weight > 50) {
        summary += "Your strong academic focus suggests you thrive in intellectually challenging environments.";
        if (!traits.includes('Academic-focused')) traits.push('Academic-focused');
      } else if (sectionWeights.campus && sectionWeights.campus.weight > 35) {
        summary += "Your emphasis on campus life indicates you value community and the full university experience.";
        if (!traits.includes('Community-oriented')) traits.push('Community-oriented');
      }
    }
    
    // 5. Final Validity Polish
    if (isV3 && scoring.v3.validity_check && !scoring.v3.validity_check.is_valid) {
      summary = "Your profile shows some interesting patterns that suggest an unconventional approach to the assessment. " + summary;
    }

    if (!summary) {
      summary = "Your responses show a balanced approach to your educational journey, valuing both academic growth and lifestyle factors.";
      traits.push('Thoughtful', 'Balanced', 'Decisive');
    }
    
    return {
      summary: summary.trim(),
      traits: traits.slice(0, 3)
    };
  }

}

const quizScoringService = new QuizScoringService();

export default quizScoringService;
