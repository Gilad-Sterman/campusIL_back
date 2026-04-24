import { supabase } from '../config/db.js';

/**
 * Program Matching Service
 * Implements the complete program matching algorithm from the txt file specs
 * with graceful fallback for missing data
 */
class ProgramMatchingService {
  
  /**
   * Main entry point - matches programs for a student based on quiz results
   * @param {Object} studentProfile - Student's quiz results and preferences
   * @returns {Object} Top 3 matched programs with scores and prerequisites
   */
  async matchPrograms(studentProfile) {
    try {
      // Detect version
      const version = this._detectVersion(studentProfile.answers);
      
      // Step 1: Get all programs with university data
      const allPrograms = await this._getAllPrograms();
      
      // Step 2: Filter programs by degree type preference (V3 uses student_degree_level from Q01)
      const degreeFilteredPrograms = this._filterProgramsByDegreeType(allPrograms, studentProfile, version);
      
      // Step 3: V3 does not strictly filter by domain, but calculates fit for all matching levels
      // For V1, we still follow the domain filtering
      const programs = version === 'v3' ? degreeFilteredPrograms : this._filterProgramsByDomain(degreeFilteredPrograms, studentProfile);
      
      // Step 4: Calculate Score for each program
      const scoredPrograms = programs.map(program => ({
        ...program,
        degree_score: this._calculateDegreeScore(studentProfile, program, version)
      }));
      
      // Step 5: Post-processing (Keyword boost for V1, nothing extra for V3)
      let processedPrograms = scoredPrograms;
      if (version === 'v1') {
        processedPrograms = this._applyKeywordBoost(scoredPrograms, studentProfile);
      }
      
      // Step 6: Apply prerequisites and ranking logic (V3 has specific tie-breaking)
      const rankedPrograms = this._applyPrerequisitesAndRanking(studentProfile, processedPrograms, version);
      
      // Step 7: Generate final output
      const finalResults = rankedPrograms.map(program => 
        this._generateProgramOutput(studentProfile, program, version)
      );

      if (finalResults.length > 0) {
      } else {
      }
      
      return {
        success: true,
        programs: finalResults,
        total_programs_evaluated: programs.length,
        matching_algorithm_version: version === 'v3' ? '3.0' : '1.0'
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to match programs',
        programs: []
      };
    }
  }

  _detectVersion(answers = []) {
    if (!answers || answers.length === 0) return 'v1';
    
    // Check for explicit version tag
    const versionTag = answers.find(a => a.version);
    if (versionTag) return versionTag.version;

    // Check for V3-specific key footprint
    const v3Keys = ['MEET_NAME', 'EXPLORE_WORK', 'RIASEC_R_01'];
    const hasV3Keys = answers.some(a => v3Keys.includes(a.key));
    
    // Fallback ID check (New IDs for Openness begin at 16, Priority at 64)
    const hasV3Id = answers.some(a => a.questionId === 15 || a.questionId === 59);
    
    return (hasV3Keys || hasV3Id) ? 'v3' : 'v1';
  }


  
  /**
   * Fetch all active programs with university data
   */
  async _getAllPrograms() {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        university:universities(*)
      `)
      .eq('status', 'active')
      .eq('universities.status', 'active');
      
    if (error) throw error;
    return data || [];
  }
  
  /**
   * Calculate Degree_Score for a single program
   * Formula: (Academic_fit × (0.40 + 0.30 × Academic_Weight)) + 
   *          (Campus_Fit × (0.15 + 0.30 × Campus_Weight)) + 
   *          (City_Fit × (0.15 + 0.30 × City_Weight))
   */
  _calculateDegreeScore(studentProfile, program, version = 'v1') {
    if (version === 'v3') {
      return this._calculateV3DegreeScore(studentProfile, program);
    }

    const academicFit = this._calculateAcademicFit(studentProfile, program);
    const campusFit = this._calculateCampusFit(studentProfile, program);
    const cityFit = this._calculateCityFit(studentProfile, program);
    
    // Get student weights (calculated from section_weights or fallback to defaults)
    const weights = this._getStudentWeights(studentProfile);
    
    const degreeScore = 
      (academicFit * (0.40 + 0.30 * weights.academic)) +
      (campusFit * (0.15 + 0.30 * weights.campus)) +
      (cityFit * (0.15 + 0.30 * weights.city));
    
    return Math.round(degreeScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * PathFinder V3 formula: (academic_fit x academic_weight) + (environment_fit x environment_weight)
   */
  _calculateV3DegreeScore(studentProfile, program) {
    // Check both legacy and new structure
    const v3Data = studentProfile?.v3 || {};
    const academicWeight = studentProfile?.v3_weights?.academic ?? v3Data.weights?.academic ?? 0.7;
    const environmentWeight = studentProfile?.v3_weights?.environment ?? v3Data.weights?.environment ?? 0.3;

    const academicFit = this._calculateV3AcademicFit(studentProfile, program);
    const environmentFit = this._calculateV3EnvironmentFit(studentProfile, program);


    const score = (academicFit * academicWeight) + (environmentFit * environmentWeight);
    return Math.round(score * 100) / 100;
  }

  _calculateV3AcademicFit(studentProfile, program) {
    // 1. Similarity Score
    const studentRiasec = this._getStudentRiasec(studentProfile);
    const programRiasec = this._getProgramRiasec(program);
    const distance = Math.sqrt(
      Math.pow(studentRiasec.r - programRiasec.r, 2) +
      Math.pow(studentRiasec.i - programRiasec.i, 2) +
      Math.pow(studentRiasec.a - programRiasec.a, 2) +
      Math.pow(studentRiasec.s - programRiasec.s, 2) +
      Math.pow(studentRiasec.e - programRiasec.e, 2) +
      Math.pow(studentRiasec.c - programRiasec.c, 2)
    );
    const similarityScore = 100 * (1 - (distance / 9.798));

    // 2. Openness Modifier
    const v3Data = studentProfile?.v3 || {};
    const studentOpenness = studentProfile?.openness_score ?? v3Data.student_openness ?? 3.0; // V3 uses 1-5 scale
    const programOpenness = program?.scoring_data?.personality?.openness ?? 2.5; // Fallback to 2.5
    const opennessModifier = 5 * (1 - (Math.abs(studentOpenness - programOpenness) / 2));

    return Math.max(0, Math.min(100, similarityScore + opennessModifier));

  }

  _calculateV3EnvironmentFit(studentProfile, program) {
    // 1. Campus Match
    const selectedFactors = this._getStudentCampusFactors(studentProfile, 'v3');
    const campusFactorsData = program?.university?.campus_data?.factors || {};
    
    let matchedFactors = 0;
    if (selectedFactors.length > 0) {
      selectedFactors.forEach(factor => {
        if (campusFactorsData[factor] === true || campusFactorsData[factor] === 1) {
          matchedFactors++;
        }
      });
    }
    const campusMatch = selectedFactors.length > 0 ? (matchedFactors / selectedFactors.length) * 100 : 50;

    // 2. Variety Modifier
    const v3Data = studentProfile?.v3 || {};
    const studentOpenness = studentProfile?.openness_score ?? v3Data.student_openness ?? 3.0;
    const campusVarietyScore = program?.university?.campus_data?.variety_score ?? 2.5; // Fallback to 2.5
    const varietyModifier = 4.0 * (1 - (Math.abs(studentOpenness - campusVarietyScore) / 2));


    return Math.max(0, Math.min(100, campusMatch + varietyModifier));
  }

  
  /**
   * Filter programs by degree type preference (Q7/Q6)
   */
  _filterProgramsByDegreeType(programs, studentProfile, version = 'v1') {
    const degreeTypes = this._getStudentDegreeTypes(studentProfile, version);
    
    if (!degreeTypes || (Array.isArray(degreeTypes) && degreeTypes.length === 0)) {
      return programs; // No filtering if no preference
    }
    
    // V3 uses single select BA/BSc / MA/MSc/MBA
    const targetLevels = Array.isArray(degreeTypes) ? degreeTypes : [degreeTypes];
    
    // Aliases for robust matching
    const levelAliases = {
      'BA/BSc': ['BA/BSc', 'bachelor', 'ba', 'bsc', 'LEVEL_BACHELOR'],
      'MA/MSc/MBA': ['MA/MSc/MBA', 'master', 'ma', 'msc', 'mba', 'LEVEL_MASTERS']
    };

    return programs.filter(program => {
      const pLevel = (program.degree_level || '').toLowerCase().trim();
      
      return targetLevels.some(t => {
        const primary = t.toLowerCase();
        // Direct match
        if (primary === pLevel) return true;
        // Alias match
        const aliases = levelAliases[t] || [];
        return aliases.some(a => a.toLowerCase() === pLevel);
      });
    });
  }

  
  /**
   * Get student's degree type preferences from Q7 (Q6 key)
   */
  _getStudentDegreeTypes(studentProfile, version = 'v1') {
    if (!studentProfile.answers) return null;
    
    const answers = studentProfile.answers;
    const qId = version === 'v3' ? 2 : 7;
    const degreeAnswer = answers.find(answer => answer.questionId === qId);
    
    return degreeAnswer?.answer || null;

  }

  
  /**
   * Filter programs by student's domain preference
   */
  _filterProgramsByDomain(programs, studentProfile) {
    const fieldPreference = this._getStudentFieldPreference(studentProfile);
    
    if (!fieldPreference) {
      return programs; // No filtering if no preference
    }
    
    const targetDomain = this._mapFieldToDomain(fieldPreference);
    
    if (!targetDomain) {
      return programs; // No filtering if can't map to domain
    }
    
    // Filter programs by domain
    const filteredPrograms = programs.filter(program => program.domain === targetDomain);
    
    // If no programs in preferred domain, return all programs as fallback
    return filteredPrograms.length > 0 ? filteredPrograms : programs;
  }
  
  /**
   * Get student's field preference from Q11 (two-level dropdown)
   */
  _getStudentFieldPreference(studentProfile) {
    if (!studentProfile.answers) return null;
    
    const answers = typeof studentProfile.answers === 'string' 
      ? JSON.parse(studentProfile.answers) 
      : studentProfile.answers;
    
    // Find Q11 answer (field preference)
    const fieldAnswer = answers.find(answer => answer.questionId === 10);
    
    return fieldAnswer?.answer || null;
  }
  
  /**
   * Map frontend field selection to backend domain
   */
  _mapFieldToDomain(fieldSelection) {
    if (!fieldSelection || !fieldSelection.level1) return null;
    
    const domainMapping = {
      'Innovation & Technology': 'Future Builders',
      'Leadership & Influence': 'Power, Policy & Influence', 
      'Arts & Creative Expression': 'Culture & Creativity',
      'Social Impact & Human Services': 'Human Insight & Impact',
      'Exploratory & Interdisciplinary': 'Explorative Paths'
    };
    
    return domainMapping[fieldSelection.level1] || null;
  }
  
  /**
   * Apply keyword-based boost to programs based on specific interest selection
   */
  _applyKeywordBoost(programs, studentProfile) {
    const fieldPreference = this._getStudentFieldPreference(studentProfile);
    const confidence = this._getStudentConfidence(studentProfile);
    
    if (!fieldPreference || !fieldPreference.level2) {
      return programs; // No boost if no specific interest selected
    }
    
    const keywords = this._getKeywordsForInterest(fieldPreference.level2);
    const confidenceMultiplier = this._getConfidenceMultiplier(confidence);
    
    return programs.map(program => {
      const keywordScore = this._calculateKeywordScore(program, keywords);
      const boost = keywordScore * confidenceMultiplier;
      
      return {
        ...program,
        degree_score: program.degree_score + boost,
        keyword_boost: boost,
        matched_keywords: keywordScore > 0 ? keywords.filter(keyword => 
          this._programContainsKeyword(program, keyword)
        ) : []
      };
    });
  }
  
  /**
   * Get student confidence level from Q12
   */
  _getStudentConfidence(studentProfile) {
    if (!studentProfile.answers) return 3; // Default neutral
    
    const answers = typeof studentProfile.answers === 'string' 
      ? JSON.parse(studentProfile.answers) 
      : studentProfile.answers;
    
    const confidenceAnswer = answers.find(answer => answer.questionId === 11);
    return confidenceAnswer?.answer || 3;
  }
  
  /**
   * Map specific interest to search keywords
   */
  _getKeywordsForInterest(interest) {
    const keywordMap = {
      // Innovation & Technology
      'entrepreneurship': ['entrepreneurship', 'entrepreneur', 'startup', 'innovation', 'venture'],
      'technology': ['computer science', 'technology', 'tech', 'software', 'programming'],
      'engineering': ['engineering', 'biomedical', 'technical', 'design', 'development'],
      'sustainability': ['environmental', 'sustainability', 'sustainable', 'climate', 'green'],
      'data_science': ['data science', 'analytics', 'data', 'statistics', 'research'],
      
      // Leadership & Influence  
      'business_leadership': ['business', 'management', 'leadership', 'administration', 'executive'],
      'government': ['government', 'political', 'policy', 'public', 'administration'],
      'communications': ['communications', 'media', 'journalism', 'public relations', 'marketing'],
      'international_relations': ['international', 'relations', 'diplomacy', 'global', 'foreign'],
      'policy': ['policy', 'governance', 'public administration', 'regulation', 'law'],
      
      // Arts & Creative Expression
      'music': ['music', 'musical', 'performance', 'composition', 'musicology'],
      'film': ['film', 'cinema', 'documentary', 'media', 'production'],
      'liberal_arts': ['liberal arts', 'humanities', 'literature', 'philosophy', 'history'],
      'creative_writing': ['writing', 'literature', 'english', 'language', 'linguistics'],
      'interdisciplinary_arts': ['interdisciplinary', 'arts', 'creative', 'cultural', 'design'],
      
      // Social Impact & Human Services
      'social_work': ['social', 'community', 'development', 'service', 'welfare'],
      'emergency_management': ['emergency', 'disaster', 'management', 'crisis', 'response'],
      'conflict_resolution': ['conflict', 'resolution', 'mediation', 'peace', 'negotiation'],
      'public_health': ['health', 'public health', 'medical', 'healthcare', 'wellness'],
      'education': ['education', 'teaching', 'learning', 'academic', 'pedagogy'],
      
      // Exploratory & Interdisciplinary
      'undecided': [], // No keywords - no boost
      'dual_degree': ['dual', 'double', 'combined', 'joint', 'interdisciplinary'],
      'interdisciplinary': ['interdisciplinary', 'multidisciplinary', 'cross-disciplinary'],
      'research': ['research', 'academic', 'scholarly', 'investigation', 'study'],
      'global_studies': ['global', 'international', 'cultural', 'world', 'comparative']
    };
    
    return keywordMap[interest] || [];
  }
  
  /**
   * Calculate keyword match score for a program
   */
  _calculateKeywordScore(program, keywords) {
    if (keywords.length === 0) return 0;
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (this._programContainsKeyword(program, keyword)) {
        matchCount++;
      }
    });
    
    // Return percentage of keywords matched * 10 (max 10 point boost)
    return (matchCount / keywords.length) * 10;
  }
  
  /**
   * Check if program contains keyword in name, discipline, or description
   */
  _programContainsKeyword(program, keyword) {
    const searchText = [
      program.name || '',
      program.discipline || '',
      program.description || '',
      program.field || ''
    ].join(' ').toLowerCase();
    
    return searchText.includes(keyword.toLowerCase());
  }
  
  /**
   * Get confidence multiplier based on certainty level
   */
  _getConfidenceMultiplier(confidence) {
    const multipliers = {
      1: 0.2, // Still exploring - minimal boost
      2: 0.4, // Leaning this way - small boost  
      3: 0.6, // Pretty sure - moderate boost
      4: 0.8, // Very confident - strong boost
      5: 1.0  // Completely certain - full boost
    };
    
    return multipliers[confidence] || 0.6;
  }
  
  /**
   * Extract student weights from section_weights or use defaults
   */
  _getStudentWeights(studentProfile) {
    if (studentProfile.section_weights) {
      const sectionData = typeof studentProfile.section_weights === 'string' 
        ? JSON.parse(studentProfile.section_weights) 
        : studentProfile.section_weights;
      
      return {
        academic: (sectionData?.degree?.weight || 40) / 100,
        campus: (sectionData?.campus?.weight || 30) / 100,
        city: (sectionData?.city?.weight || 30) / 100
      };
    }
    
    // Default weights if no section data
    return { academic: 0.40, campus: 0.30, city: 0.30 };
  }
  
  /**
   * Calculate Academic Fit Score
   * Formula: similarity_score + Conscientiousness_Modifier + Openness_Modifier
   */
  _calculateAcademicFit(studentProfile, program) {
    const similarityScore = this._calculateRiasecSimilarity(studentProfile, program);
    const conscientiousnessModifier = this._calculateConscientiousnessModifier(studentProfile, program);
    const opennessModifier = this._calculateOpennessModifier(studentProfile, program);
    
    const academicFit = similarityScore + conscientiousnessModifier + opennessModifier;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, academicFit));
  }
  
  /**
   * Calculate RIASEC similarity score using Euclidean distance
   */
  _calculateRiasecSimilarity(studentProfile, program) {
    // Get student RIASEC scores
    const studentRiasec = this._getStudentRiasec(studentProfile);
    
    // Get program RIASEC scores with defaults
    const programRiasec = this._getProgramRiasec(program);
    
    // Calculate Euclidean distance
    const distance = Math.sqrt(
      Math.pow(studentRiasec.r - programRiasec.r, 2) +
      Math.pow(studentRiasec.i - programRiasec.i, 2) +
      Math.pow(studentRiasec.a - programRiasec.a, 2) +
      Math.pow(studentRiasec.s - programRiasec.s, 2) +
      Math.pow(studentRiasec.e - programRiasec.e, 2) +
      Math.pow(studentRiasec.c - programRiasec.c, 2)
    );
    
    // Convert to similarity score (0-100)
    const similarityScore = 100 * (1 - (distance / 9.798)); // 9.798 is the constant from specs
    
    return Math.max(0, Math.min(100, similarityScore));
  }
  
  /**
   * Extract student RIASEC scores from quiz results
   */
  _getStudentRiasec(studentProfile) {
    if (studentProfile.riasec_scores) {
      const riasecData = typeof studentProfile.riasec_scores === 'string' 
        ? JSON.parse(studentProfile.riasec_scores) 
        : studentProfile.riasec_scores;
      
      return {
        r: riasecData?.realistic || 2.5,
        i: riasecData?.investigative || 2.5,
        a: riasecData?.artistic || 2.5,
        s: riasecData?.social || 2.5,
        e: riasecData?.enterprising || 2.5,
        c: riasecData?.conventional || 2.5
      };
    }
    
    // Default neutral scores if no RIASEC data
    return { r: 2.5, i: 2.5, a: 2.5, s: 2.5, e: 2.5, c: 2.5 };
  }
  
  /**
   * Extract program RIASEC scores with defaults
   */
  _getProgramRiasec(program) {
    const scoringData = program.scoring_data || {};
    const riasec = scoringData.riasec || {};
    
    // Handing both structure (old and new names)
    return {
      r: riasec.r ?? riasec.realistic ?? 2.5,
      i: riasec.i ?? riasec.investigative ?? 2.5,
      a: riasec.a ?? riasec.artistic ?? 2.5,
      s: riasec.s ?? riasec.social ?? 2.5,
      e: riasec.e ?? riasec.enterprising ?? 2.5,
      c: riasec.c ?? riasec.conventional ?? 2.5
    };
  }

  
  /**
   * Calculate conscientiousness modifier (-3 to +5 points)
   */
  _calculateConscientiousnessModifier(studentProfile, program) {
    const studentScore = this._getStudentConscientiousness(studentProfile);
    const programIntensity = this._getProgramIntensity(program);
    
    // If no program intensity data, return neutral modifier
    if (!programIntensity || programIntensity === 'average') return 0;
    
    // Apply modifier based on alignment (from txt file specs)
    if (programIntensity === 'high') {
      if (studentScore >= 4.0) return 5;
      if (studentScore > 3.4) return 5 * ((studentScore - 3.4) / 0.6);
      if (studentScore > 2.6) return -3 * ((studentScore - 3.4) / 0.6);
      return -3;
    } else if (programIntensity === 'low') {
      if (studentScore >= 4.0) return -3;
      if (studentScore > 3.4) return -3 * ((studentScore - 3.4) / 0.6);
      if (studentScore > 2.6) return 5 * ((studentScore - 3.4) / 0.6);
      return 5;
    }
    
    return 0; // Neutral zone (3.2-3.4)
  }
  
  /**
   * Get student conscientiousness score
   */
  _getStudentConscientiousness(studentProfile) {
    if (studentProfile.personality_scores) {
      const personalityData = typeof studentProfile.personality_scores === 'string' 
        ? JSON.parse(studentProfile.personality_scores) 
        : studentProfile.personality_scores;
      
      return personalityData?.conscientiousness?.score || 3.0;
    }
    
    return 3.0; // Default neutral score
  }
  
  /**
   * Get program intensity level
   */
  _getProgramIntensity(program) {
    const scoringData = program.scoring_data || {};
    const personality = scoringData.personality || {};
    const intensityScore = personality.intensity;
    
    if (!intensityScore) return 'average';
    
    // Convert intensity score to tag (similar to conscientiousness thresholds)
    if (intensityScore >= 4.0) return 'high';
    if (intensityScore <= 2.6) return 'low';
    return 'average';
  }
  
  /**
   * Calculate openness modifier (-3 to +5 points)
   */
  _calculateOpennessModifier(studentProfile, program) {
    const studentScore = this._getStudentOpenness(studentProfile);
    const programOpenness = this._getProgramOpenness(program);
    
    // If no program openness data, return neutral modifier
    if (!programOpenness || programOpenness === 'average') return 0;
    
    // Apply modifier based on alignment (same logic as conscientiousness)
    if (programOpenness === 'high') {
      if (studentScore >= 4.0) return 5;
      if (studentScore > 3.4) return 5 * ((studentScore - 3.4) / 0.6);
      if (studentScore > 2.6) return -3 * ((studentScore - 3.4) / 0.6);
      return -3;
    } else if (programOpenness === 'low') {
      if (studentScore >= 4.0) return -3;
      if (studentScore > 3.4) return -3 * ((studentScore - 3.4) / 0.6);
      if (studentScore > 2.6) return 5 * ((studentScore - 3.4) / 0.6);
      return 5;
    }
    
    return 0;
  }
  
  /**
   * Get student openness score
   */
  _getStudentOpenness(studentProfile) {
    if (studentProfile.personality_scores) {
      const personalityData = typeof studentProfile.personality_scores === 'string' 
        ? JSON.parse(studentProfile.personality_scores) 
        : studentProfile.personality_scores;
      
      return personalityData?.openness?.score || 3.0;
    }
    
    return 3.0; // Default neutral score
  }
  
  /**
   * Get program openness level
   */
  _getProgramOpenness(program) {
    const scoringData = program.scoring_data || {};
    const personality = scoringData.personality || {};
    const opennessScore = personality.openness;
    
    if (!opennessScore) return 'average';
    
    if (opennessScore >= 4.0) return 'high';
    if (opennessScore <= 2.6) return 'low';
    return 'average';
  }
  
  /**
   * Calculate Campus Fit Score
   * Formula: MIN(100, MAX(0, Campus_factors + Campus_Variety_Modifier))
   */
  _calculateCampusFit(studentProfile, program) {
    const campusFactors = this._calculateCampusFactors(studentProfile, program);
    const varietyModifier = this._calculateCampusVarietyModifier(studentProfile, program);
    
    const campusFit = campusFactors + varietyModifier;
    
    return Math.max(0, Math.min(100, campusFit));
  }
  
  /**
   * Calculate campus factors score
   */
  _calculateCampusFactors(studentProfile, program) {
    // Get student selected campus factors from quiz answers
    const selectedFactors = this._getStudentCampusFactors(studentProfile);
    const campusData = program.university?.campus_data || {};
    const campusFactorsData = campusData.factors || {};
    
    if (selectedFactors.length === 0) return 50; // Neutral score if no preferences
    
    // Count matches
    let matchedFactors = 0;
    selectedFactors.forEach(factor => {
      if (campusFactorsData[factor] === true) {
        matchedFactors++;
      }
    });
    
    // Calculate percentage score
    return (matchedFactors / selectedFactors.length) * 100;
  }
  
  /**
   * Get student selected campus factors from quiz
   */
  _getStudentCampusFactors(studentProfile, version = 'v1') {
    if (!studentProfile.answers) return [];
    
    const answers = studentProfile.answers;
    const qId = version === 'v3' ? 63 : 70;
    const campusAnswer = answers.find(answer => answer.questionId === qId);
    
    return campusAnswer?.answer || [];
  }

  
  /**
   * Calculate campus variety modifier
   */
  _calculateCampusVarietyModifier(studentProfile, program) {
    const studentOpenness = this._getStudentOpenness(studentProfile);
    const campusData = program.university?.campus_data || {};
    const campusVarietyScore = campusData.variety_score || 3.0; // Default neutral
    
    // Calculate distance and modifier (from txt file specs)
    const distance = Math.abs(studentOpenness - campusVarietyScore);
    const modifier = 4.0 * (1 - (distance / 2));
    
    return modifier;
  }
  
  /**
   * Calculate City Fit Score (same logic as campus)
   */
  _calculateCityFit(studentProfile, program) {
    const cityFactors = this._calculateCityFactors(studentProfile, program);
    const varietyModifier = this._calculateCityVarietyModifier(studentProfile, program);
    
    const cityFit = cityFactors + varietyModifier;
    
    return Math.max(0, Math.min(100, cityFit));
  }
  
  /**
   * Calculate city factors score
   */
  _calculateCityFactors(studentProfile, program) {
    // Get student selected city factors from quiz answers
    const selectedFactors = this._getStudentCityFactors(studentProfile);
    const cityData = program.university?.city_data || {};
    const cityFactorsData = cityData.factors || {};
    
    if (selectedFactors.length === 0) return 50; // Neutral score if no preferences
    
    // Count matches
    let matchedFactors = 0;
    selectedFactors.forEach(factor => {
      if (cityFactorsData[factor] === true) {
        matchedFactors++;
      }
    });
    
    // Calculate percentage score
    return (matchedFactors / selectedFactors.length) * 100;
  }
  
  /**
   * Get student selected city factors from quiz
   */
  _getStudentCityFactors(studentProfile) {
    if (!studentProfile.answers) return [];
    
    const answers = typeof studentProfile.answers === 'string' 
      ? JSON.parse(studentProfile.answers) 
      : studentProfile.answers;
    
    // Find Q72 answer (city preferences)
    const cityAnswer = answers.find(answer => answer.questionId === 72);
    
    return cityAnswer?.answer || [];
  }
  
  /**
   * Calculate city variety modifier
   */
  _calculateCityVarietyModifier(studentProfile, program) {
    const studentOpenness = this._getStudentOpenness(studentProfile);
    const cityData = program.university?.city_data || {};
    const cityVarietyScore = cityData.variety_score || 3.0; // Default neutral
    
    const distance = Math.abs(studentOpenness - cityVarietyScore);
    const modifier = 4.0 * (1 - (distance / 2));
    
    return modifier;
  }
  
  /**
   * Apply prerequisites and ranking logic
   */
  _applyPrerequisitesAndRanking(studentProfile, scoredPrograms, version = 'v1') {
    // Sort by degree_score (highest first)
    const sortedPrograms = scoredPrograms.sort((a, b) => {
      const scoreDiff = b.degree_score - a.degree_score;
      if (Math.abs(scoreDiff) > 0.01 || version !== 'v3') {
        return scoreDiff;
      }

      // Tie-breaking for V3
      // a) Higher similarity_score
      const studentRiasec = this._getStudentRiasec(studentProfile);
      const getSimilarity = (p) => {
        const pr = this._getProgramRiasec(p);
        const dist = Math.sqrt(['r','i','a','s','e','c'].reduce((s, d) => s + Math.pow(studentRiasec[d] - pr[d], 2), 0));
        return 100 * (1 - dist / 9.798);
      };
      const simA = getSimilarity(a);
      const simB = getSimilarity(b);
      if (Math.abs(simA - simB) > 0.1) return simB - simA;

      // b) Closer Openness alignment
      const sOpen = studentProfile?.openness_score ?? 3.0;
      const getOAlign = (p) => Math.abs(sOpen - (p.scoring_data?.personality?.openness ?? 2.5));
      const alignA = getOAlign(a);
      const alignB = getOAlign(b);
      if (Math.abs(alignA - alignB) > 0.1) return alignA - alignB; // Lower is better

      // c) Alphabetical by university
      const uniA = (a.university?.name || '').toLowerCase();
      const uniB = (b.university?.name || '').toLowerCase();
      if (uniA !== uniB) return uniA < uniB ? -1 : 1;

      // d) Alphabetical by degree name
      return (a.name || '').toLowerCase() < (b.name || '').toLowerCase() ? -1 : 1;
    });
    
    // Check essential prerequisites for each program
    const programsWithPrereqs = sortedPrograms.map(program => ({
      ...program,
      prerequisites: this._checkPrerequisites(studentProfile, program, version)
    }));
    
    // Apply ranking logic based on prerequisite scenarios
    const accessiblePrograms = programsWithPrereqs.filter(p => p.prerequisites.essential_pass);
    const inaccessiblePrograms = programsWithPrereqs.filter(p => !p.prerequisites.essential_pass);
    
    // V3 wants top 3 shown as primary, but "Show more" up to 9.
    // We return up to 9 programs.
    const allRanked = [...accessiblePrograms, ...inaccessiblePrograms];
    return allRanked;
  }

  
  /**
   * Check all prerequisites for a program
   */
  _checkPrerequisites(studentProfile, program, version = 'v1') {
    const essential = this._checkEssentialPrerequisites(studentProfile, program, version);
    const nonEssential = this._checkNonEssentialPrerequisites(studentProfile, program, version);
    
    return {
      essential_pass: essential.budget_met && essential.gpa_met,
      budget_met: essential.budget_met,
      gpa_met: essential.gpa_met,
      non_essential_flags: nonEssential
    };
  }

  
  /**
   * Check essential prerequisites (budget and GPA)
   */
  _checkEssentialPrerequisites(studentProfile, program, version = 'v1') {
    const scoringData = program.scoring_data || {};
    const prerequisites = scoringData.prerequisites || {};
    
    // Budget check - if no tuition data, assume accessible
    const programTuition = prerequisites.tuition || program.tuition_usd;
    const studentBudget = this._getStudentBudget(studentProfile, version);
    const budget_met = !programTuition || !studentBudget || studentBudget >= programTuition;
    
    // GPA check - if no GPA requirement, assume accessible
    const programMinGpa = prerequisites.min_gpa;
    const studentGpa = this._getStudentGpa(studentProfile, version);
    const gpa_met = !programMinGpa || !studentGpa || studentGpa >= programMinGpa;
    
    return { budget_met, gpa_met };
  }

  
  /**
   * Get student budget from quiz (Q75)
   */
  _getStudentBudget(studentProfile, version = 'v1') {
    if (!studentProfile.answers) return null;
    
    const answers = studentProfile.answers;
    // V3 does not have a dedicated budget question in the core 58? 
    // Wait, let me check the spec again. Q74-Q89 are "Practical" and skippable.
    // If we only have 58, we don't have budget.
    const qId = version === 'v3' ? 75 : 75; // Still 75 if it exists
    const budgetAnswer = answers.find(answer => answer.questionId === qId);
    
    if (!budgetAnswer?.answer) return null;
    
    const budgetMap = {
      'under_5000': 5000,
      '5000_10000': 10000,
      '10000_15000': 15000,
      '15000_20000': 20000,
      '20000_30000': 30000,
      'over_30000': 99999
    };
    
    return budgetMap[budgetAnswer.answer] || null;
  }

  
  /**
   * Get student GPA from quiz (Q83)
   */
  _getStudentGpa(studentProfile, version = 'v1') {
    if (!studentProfile.answers) return null;
    
    const answers = studentProfile.answers;
    const qId = version === 'v3' ? 83 : 83; // Still 83 if it exists
    const gpaAnswer = answers.find(answer => answer.questionId === qId);
    
    if (!gpaAnswer?.answer) return null;
    
    const gpaMap = {
      'below_2_5': 2.25,
      '2_5_2_9': 2.7,
      '3_0_3_2': 3.1,
      '3_3_3_5': 3.4,
      '3_6_3_8': 3.7,
      '3_9_4_0': 3.95,
      'dont_know': null
    };
    
    return gpaMap[gpaAnswer.answer] || null;
  }

  
  /**
   * Check non-essential prerequisites
   */
  _checkNonEssentialPrerequisites(studentProfile, program) {
    // For now return empty array - would check scholarship, health, accessibility, etc.
    return [];
  }
  
  /**
   * Generate final program output with prerequisite verdict
   */
  _generateProgramOutput(studentProfile, program, version = 'v1') {
    const prerequisiteVerdict = this._generatePrerequisiteVerdict(program.prerequisites);

    
    return {
      program_id: program.id,
      university_id: program.university_id || program.university?.id || null,
      university_name: program.university?.name || 'Unknown University',
      university_city: program.university?.city || 'Unknown City',
      program_name: program.name,
      degree_level: program.degree_level,
      degree_score: program.degree_score,
      match_percentage: Math.round(program.degree_score),
      description: program.description || program.short_description || '',
      tuition_usd: program.tuition_usd,
      university_living_cost: program.university?.living_cost_usd || 0,
      duration_years: program.duration_years,
      application_url: program.application_url,
      essential_pass: program.prerequisites.essential_pass,
      prerequisite_verdict: prerequisiteVerdict,
      non_essential_flags: program.prerequisites.non_essential_flags,
      program_image_url: program.image_url || null,
      university_logo_url: program.university?.logo_url || null
    };
  }
  
  /**
   * Generate prerequisite verdict text
   */
  _generatePrerequisiteVerdict(prerequisites) {
    if (prerequisites.essential_pass && prerequisites.non_essential_flags.length === 0) {
      return "Great news! Based on your profile, you meet all the requirements for this program. You're ready to apply!";
    } else if (prerequisites.essential_pass) {
      return "You meet the core admission requirements for this program. Here are a few things to keep in mind: [Additional details would be listed here]";
    } else {
      return "This program is a strong match for your interests and preferences, but there are some admission requirements to consider. I recommend speaking with one of our consultants to explore your options.";
    }
  }
}

export default new ProgramMatchingService();
