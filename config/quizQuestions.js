const TEST_12_QUESTIONS = [
  { id: 1, key: 'q1', type: 'text_field', required: true, config: { maxLength: 100 } },
  { id: 2, key: 'q2', type: 'multi_select', required: true, config: { maxSelections: 3 } },
  {
    id: 3,
    key: 'q3',
    type: 'constraint_slider',
    required: true,
    config: {
      targetTotal: 100,
      categories: ['degree', 'campus', 'city']
    }
  },
  { id: 4, key: 'q4', type: 'dropdown', required: true, config: {} },
  { id: 5, key: 'q5', type: 'two_level_dropdown', required: true, config: {} },
  { id: 6, key: 'q6', type: 'likert', required: true, config: { min: 1, max: 5 } },
  {
    id: 7,
    key: 'q7',
    type: 'nested_rating',
    required: true,
    config: {
      min: 0,
      max: 4,
      items: ['business', 'calculator', 'electronics', 'chemistry']
    }
  },
  { id: 8, key: 'q8', type: 'dropdown', required: true, config: {} },
  {
    id: 9,
    key: 'q9',
    type: 'currency',
    required: true,
    showIf: {
      questionId: 8,
      operator: 'in',
      value: ['partial', 'full']
    },
    config: { minAmount: 0, maxAmount: 100000 }
  },
  { id: 10, key: 'q10', type: 'date', required: true, config: {} },
  {
    id: 11,
    key: 'q11',
    type: 'multi_select',
    required: true,
    showIf: {
      questionId: 6,
      operator: 'gte',
      value: 4
    },
    config: { minSelections: 2, maxSelections: 4 }
  },
  { id: 12, key: 'q12', type: 'likert', required: true, config: { min: 1, max: 5 } }
];

const V2_QUESTIONS = TEST_12_QUESTIONS;

export const QUIZ_QUESTION_SETS = {
  test12: TEST_12_QUESTIONS,
  v2: V2_QUESTIONS
};

const requestedQuizVersion = String(process.env.QUIZ_VERSION || 'test12').toLowerCase();
export const ACTIVE_QUIZ_VERSION = QUIZ_QUESTION_SETS[requestedQuizVersion] ? requestedQuizVersion : 'test12';

export const QUIZ_QUESTIONS = QUIZ_QUESTION_SETS[ACTIVE_QUIZ_VERSION];

export const getQuestionById = (questionId) => {
  const normalizedId = Number(questionId);
  return QUIZ_QUESTIONS.find((question) => question.id === normalizedId) || null;
};

export const getTotalQuestions = () => QUIZ_QUESTIONS.length;

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
      const itemIds = question.config?.items || [];
      if (itemIds.length === 0) return false;

      return itemIds.every((itemId) => {
        const value = Number(answer[itemId]);
        return Number.isFinite(value) && value >= question.config.min && value <= question.config.max;
      });
    }
    case 'constraint_slider': {
      if (!answer || typeof answer !== 'object') return false;
      const total = Object.values(answer).reduce((sum, value) => sum + Number(value || 0), 0);
      return total === question.config.targetTotal;
    }
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
