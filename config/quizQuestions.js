export const TEST_12_QUESTIONS = [
  // --- STAGE 1: PERSONAL PREFERENCES ---
  {
    id: 1,
    key: 'q1',
    type: 'text_field',
    title: "What's your name?",
    required: true,
    config: {
      placeholder: 'Enter your name',
      maxLength: 100
    }
  },
  {
    id: 2,
    key: 'q2',
    type: 'multi_select',
    title: "Nice to meet you! What kinds of things do you actually enjoy doing?",
    description: "Pick as many as feel true",
    required: true,
    config: {
      options: [
        { value: 'creative', label: 'Creating things- art, music, writing, or building' },
        { value: 'problem_solving', label: 'Figuring out how things work' },
        { value: 'helping', label: 'Helping people directly' },
        { value: 'social', label: 'Hanging out with friends' },
        { value: 'learning', label: 'Learning new things constantly' },
        { value: 'active', label: 'Being active or outdoors' },
        { value: 'organizing', label: 'Organizing and planning' },
        { value: 'performing', label: 'Performing or presenting' },
        { value: 'deep_talk', label: 'Having deep conversations' },
        { value: 'relaxing', label: 'Honestly? Scrolling, gaming, consuming content' }
      ]
    }
  },
  {
    id: 3,
    key: 'q3',
    type: 'multi_select',
    title: "What actually matters to you in life?",
    description: "Pick your top 5",
    required: true,
    config: {
      maxSelections: 5,
      options: [
        { value: 'growth', label: 'Growing and becoming better' },
        { value: 'relationships', label: 'My close relationships' },
        { value: 'impact', label: 'Making an actual impact' },
        { value: 'freedom', label: 'Freedom and independence' },
        { value: 'adventure', label: 'Adventure and new experiences' },
        { value: 'creation', label: 'Creating things that didn\'t exist before' },
        { value: 'understanding', label: 'Understanding how the world works' },
        { value: 'security', label: 'Security and stability' },
        { value: 'authenticity', label: 'Being authentic and true to myself' },
        { value: 'joy', label: 'Enjoying life and being happy' }
      ]
    }
  },
  {
    id: 4,
    key: 'q4',
    type: 'multi_select',
    title: "What helps YOU when things get hard?",
    description: "Pick up to 3",
    required: true,
    config: {
      maxSelections: 3,
      options: [
        { value: 'resilience', label: 'Remembering I\'ve gotten through hard things before' },
        { value: 'belief', label: 'People who believe in me' },
        { value: 'family', label: 'My family supporting me' },
        { value: 'friends', label: 'Friends who get it' },
        { value: 'mentors', label: 'Mentors or guides' },
        { value: 'growth_mindset', label: 'Believing I can grow and improve' },
        { value: 'perspective', label: 'Taking a step back' },
        { value: 'purpose', label: 'Remembering why I started' },
        { value: 'persistence', label: 'Just keeping going' },
        { value: 'chunking', label: 'Breaking it into smaller pieces' }
      ]
    }
  },
  {
    id: 5,
    key: 'q5',
    type: 'constraint_slider',
    title: "Imagine you have 100 points to distribute based on importance:",
    required: true,
    config: {
      targetTotal: 100,
      categories: [
        { key: 'degree', label: 'The degree I am learning' },
        { key: 'campus', label: 'The campus environment' },
        { key: 'city', label: 'The city where I would live' }
      ]
    }
  },
  {
    id: 6, // Was 101
    key: 'FILLER_1',
    type: 'statement',
    title: "Nice work! You've set your priorities.",
    description: "Next up: Let's figure out what drives you.",
    required: false
  },
  {
    id: 7, // Was 6
    key: 'q6',
    type: 'multi_select',
    title: "What type of degree are you looking for in Israel?",
    required: true,
    config: {
      maxSelections: 3,
      options: [
        { value: 'bachelor', label: "Bachelor's degree (BA, BSc)" },
        { value: 'master', label: "Master's degree (MA, MSc, MBA)" },
        { value: 'phd', label: "PhD" }
      ]
    }
  },
  {
    id: 8, // Was 7
    key: 'q7',
    type: 'multi_select',
    title: "What would you like to achieve by learning a degree in Israel?",
    description: "Select up to 3 that are most important to you",
    required: true,
    config: {
      maxSelections: 3,
      options: [
        { value: 'degree', label: 'Achieve an academic degree' },
        { value: 'career', label: 'Access better career opportunities' },
        { value: 'growth', label: 'Develop personally and intellectually' },
        { value: 'experience', label: 'Gain international experience' },
        { value: 'language', label: 'Learn or improve a new language' },
        { value: 'network', label: 'Build an international network' },
        { value: 'living', label: 'Experience living in a different country' },
        { value: 'opportunities', label: 'Access opportunities not available at home' }
      ]
    }
  },
  {
    id: 9, // Was 102
    key: 'FILLER_2',
    type: 'statement',
    title: "Perfect! We are ready to move forward.",
    description: "I am learning more about who you are. The more I learn, the better I can help.",
    required: false
  },

  // --- STAGE 2A: VOCATIONAL PROFILE (INTRO) ---
  {
    id: 10, // Was 8
    key: 'q8',
    type: 'dropdown',
    title: "Do you already know what you want to learn?",
    required: true,
    config: {
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'idea', label: 'I have an idea but I want to explore' }
      ]
    }
  },
  {
    id: 11, // Was 9
    key: 'q9',
    type: 'two_level_dropdown',
    title: "What would you like to learn?",
    required: true,
    showIf: {
      questionId: 10, // Updated ID ref
      operator: 'in',
      value: ['yes', 'idea']
    },
    config: {
      level1Label: 'Discipline',
      level2Label: 'Specific Program',
      options: {
        engineering: [
          { value: 'computer_science', label: 'Computer Science' },
          { value: 'electrical_engineering', label: 'Electrical Engineering' },
          { value: 'mechanical_engineering', label: 'Mechanical Engineering' }
        ],
        business: [
          { value: 'business_admin', label: 'Business Administration' },
          { value: 'finance', label: 'Finance' },
          { value: 'marketing', label: 'Marketing' }
        ],
        social_sciences: [
          { value: 'psychology', label: 'Psychology' },
          { value: 'sociology', label: 'Sociology' },
          { value: 'political_science', label: 'Political Science' }
        ],
        humanities: [
          { value: 'history', label: 'History' },
          { value: 'philosophy', label: 'Philosophy' },
          { value: 'literature', label: 'Literature' }
        ],
        medical: [
          { value: 'medicine', label: 'Medicine' },
          { value: 'nursing', label: 'Nursing' }
        ]
      }
    }
  },
  {
    id: 12, // Was 10
    key: 'q10',
    type: 'likert',
    title: "How certain are you that this is the right choice for you?",
    required: true,
    showIf: {
      questionId: 10, // Updated ID ref
      operator: 'equals',
      value: 'yes'
    },
    config: {
      min: 1,
      max: 5,
      labels: ['Still exploring', 'Leaning this way', 'Pretty sure', 'Very confident', 'Completely certain']
    }
  },
  {
    id: 13, // Was 103
    key: 'FILLER_3',
    type: 'statement',
    title: "I understand. Let's go deeper.",
    description: "The next questions look at your natural tendencies. There are no wrong answers—just be honest.",
    required: false,
    showIf: {
      questionId: 10, // Updated ID ref
      operator: 'in',
      value: ['no', 'idea']
    }

  },

  // --- STAGE 2A: VOCATIONAL PROFILE (PERSONALITY PART 1) ---
  // Questions q11 - q34 (Big 5 / Conscientiousness etc)
  { id: 14, key: 'q11', type: 'likert', title: "I complete tasks successfully.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 15, key: 'q12', type: 'likert', title: "I excel in what I do.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 16, key: 'q13', type: 'likert', title: "I handle tasks smoothly.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 17, key: 'q14', type: 'likert', title: "I know how to get things done.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 18, key: 'q15', type: 'likert', title: "I like to tidy up.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 19, key: 'q16', type: 'likert', title: "I often forget to put things back in their proper place.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 20, key: 'q17', type: 'likert', title: "I leave a mess in my room.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 21, key: 'q18', type: 'likert', title: "I leave my belongings around.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 22, key: 'q19', type: 'likert', title: "I keep my promises.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 23, key: 'q20', type: 'likert', title: "I tell the truth.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 24, key: 'q21', type: 'likert', title: "I break rules.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 25, key: 'q22', type: 'likert', title: "I break my promises.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 26, key: 'q23', type: 'likert', title: "I do more than what's expected of me.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 27, key: 'q24', type: 'likert', title: "I work hard.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 28, key: 'q25', type: 'likert', title: "I put little time and effort into my work.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 29, key: 'q26', type: 'likert', title: "I do just enough work to get by.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 30, key: 'q27', type: 'likert', title: "I am always prepared.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 31, key: 'q28', type: 'likert', title: "I carry out my plans.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 32, key: 'q29', type: 'likert', title: "I waste my time.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 33, key: 'q30', type: 'likert', title: "I have difficulty starting tasks.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 34, key: 'q31', type: 'likert', title: "I jump into things without thinking.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 35, key: 'q32', type: 'likert', title: "I make rash decisions.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 36, key: 'q33', type: 'likert', title: "I rush into things.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  { id: 37, key: 'q34', type: 'likert', title: "I act without thinking.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } }
];

// FULL_QUIZ_QUESTIONS will be imported dynamically to avoid circular imports

const V2_QUESTIONS = TEST_12_QUESTIONS;

// Import full questions directly now that circular dependency is resolved
import { FULL_QUIZ_QUESTIONS } from './fullQuizQuestions.js';

export const QUIZ_QUESTION_SETS = {
  test12: TEST_12_QUESTIONS,
  v2: V2_QUESTIONS,
  full: FULL_QUIZ_QUESTIONS
};

const requestedQuizVersion = String(process.env.QUIZ_VERSION || 'full').toLowerCase();
export const ACTIVE_QUIZ_VERSION = QUIZ_QUESTION_SETS[requestedQuizVersion] ? requestedQuizVersion : 'test12';

export const QUIZ_QUESTIONS = QUIZ_QUESTION_SETS[ACTIVE_QUIZ_VERSION];

export const getTotalQuestions = () => QUIZ_QUESTIONS.length;

export const getQuestionById = (questionId) => {
  const normalizedId = Number(questionId);
  return QUIZ_QUESTIONS.find((question) => question.id === normalizedId) || null;
};

export const getQuestionIds = () => QUIZ_QUESTIONS.map((question) => question.id);

const buildAnswerMap = (answers = []) => {
  return answers.reduce((acc, entry) => {
    if (entry && typeof entry === 'object' && 'questionId' in entry) {
      acc[Number(entry.questionId)] = entry.answer;
    }
    return acc;
  }, {});
};

const evaluateCondition = (condition, answerMap) => {
  if (!condition) return true;

  const actual = answerMap[Number(condition.questionId)];
  const expected = condition.value;

  switch (condition.operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(actual);
    case 'gte':
      return Number(actual) >= Number(expected);
    case 'lte':
      return Number(actual) <= Number(expected);
    case 'exists':
      return actual !== null && actual !== undefined && actual !== '';
    default:
      return true;
  }
};

export const isQuestionVisible = (question, answers = []) => {
  if (!question?.showIf) return true;
  const answerMap = buildAnswerMap(answers);
  return evaluateCondition(question.showIf, answerMap);
};

export const getVisibleQuestionIds = (answers = []) => {
  const answerMap = buildAnswerMap(answers);

  return QUIZ_QUESTIONS
    .filter((question) => {
      if (!question.showIf) return true;
      return evaluateCondition(question.showIf, answerMap);
    })
    .map((question) => question.id);
};

export const getNextVisibleQuestionId = (currentQuestionId, answers = []) => {
  const visibleIds = getVisibleQuestionIds(answers);
  const currentIndex = visibleIds.indexOf(Number(currentQuestionId));
  if (currentIndex === -1) return visibleIds[0] || null;
  return visibleIds[currentIndex + 1] || null;
};

export const getPreviousVisibleQuestionId = (currentQuestionId, answers = []) => {
  const visibleIds = getVisibleQuestionIds(answers);
  const currentIndex = visibleIds.indexOf(Number(currentQuestionId));
  if (currentIndex <= 0) return null;
  return visibleIds[currentIndex - 1] || null;
};

export const getVisibleProgress = (currentQuestionId, answers = []) => {
  const visibleIds = getVisibleQuestionIds(answers);
  const currentIndex = visibleIds.indexOf(Number(currentQuestionId));

  return {
    current: currentIndex >= 0 ? currentIndex + 1 : 1,
    total: visibleIds.length || 1
  };
};

export const isAnswerValidForQuestion = (question, answer) => {
  if (!question) return false;

  switch (question.type) {
    case 'text_field':
      return typeof answer === 'string' && answer.trim().length > 0;

    case 'likert': {
      const value = Number(answer);
      return Number.isFinite(value) && value >= question.config.min && value <= question.config.max;
    }

    case 'dropdown':
      return typeof answer === 'string' && answer.length > 0;

    case 'multi_select': {
      if (!Array.isArray(answer)) return false;
      const minSelections = question.config?.minSelections || 1;
      const maxSelections = question.config?.maxSelections || Number.MAX_SAFE_INTEGER;
      return answer.length >= minSelections && answer.length <= maxSelections;
    }

    case 'currency': {
      const value = Number(answer);
      return Number.isFinite(value) && value >= question.config.minAmount && value <= question.config.maxAmount;
    }

    case 'date':
      return typeof answer === 'string' && answer.length > 0;

    case 'two_level_dropdown':
      return !!answer && typeof answer === 'object' && !!answer.level1 && !!answer.level2;

    case 'nested_rating': {
      if (!answer || typeof answer !== 'object') return false;
      const itemIds = (question.config?.items || []).map((item) => item.id);
      if (itemIds.length === 0) return false;

      return itemIds.every((itemId) => {
        const value = Number(answer[itemId]);
        return Number.isFinite(value) && value >= question.config.min && value <= question.config.max;
      });
    }

    case 'constraint_slider': {
      if (!answer || typeof answer !== 'object') return false;
      const categories = question.config?.categories || [];
      const total = categories.reduce((sum, category) => {
        return sum + Number(answer[category.key] || 0);
      }, 0);
      return total === question.config.targetTotal;
    }

    case 'statement':
      // Statements are valid by default (just informational)
      return true;

    default:
      return answer !== null && answer !== undefined;
  }
};

export const isQuizCompleteForAnswers = (answers = []) => {
  const visibleIds = getVisibleQuestionIds(answers);
  const answerMap = buildAnswerMap(answers);

  const requiredVisibleQuestions = QUIZ_QUESTIONS.filter(
    (question) => visibleIds.includes(question.id) && question.required
  );

  return requiredVisibleQuestions.every((question) => {
    return isAnswerValidForQuestion(question, answerMap[question.id]);
  });
};
