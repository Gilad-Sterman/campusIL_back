// Complete 80+ question quiz configuration based on CSV file
// Includes all 37 existing questions plus new ones - no imports to avoid circular dependencies

export const FULL_QUIZ_QUESTIONS = [
  // --- STAGE 1: PERSONAL PREFERENCES --- (existing 37 questions)
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
    id: 6,
    key: 'FILLER_1',
    type: 'statement',
    title: "Nice work! You've set your priorities.",
    description: "Next up: Let's figure out what drives you.",
    required: false
  },
  {
    id: 7,
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
    id: 8,
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
    id: 9,
    key: 'FILLER_2',
    type: 'statement',
    title: "Perfect! We are ready to move forward.",
    description: "I am learning more about who you are. The more I learn, the better I can help.",
    required: false
  },
  {
    id: 10,
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
    id: 11,
    key: 'q9',
    type: 'two_level_dropdown',
    title: "What would you like to learn?",
    required: true,
    showIf: {
      questionId: 10,
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
    id: 12,
    key: 'q10',
    type: 'likert',
    title: "How certain are you that this is the right choice for you?",
    required: true,
    showIf: {
      questionId: 10,
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
    id: 13,
    key: 'FILLER_3',
    type: 'statement',
    title: "I understand. Let's go deeper.",
    description: "The next questions look at your natural tendencies. There are no wrong answers—just be honest.",
    required: false,
    showIf: {
      questionId: 10,
      operator: 'in',
      value: ['no', 'idea']
    }
  },
  // Big 5 Conscientiousness Questions (Q11-Q34)
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
  { id: 37, key: 'q34', type: 'likert', title: "I act without thinking.", required: true, config: { min: 1, max: 5, labels: ['Inaccurate', 'Moderately Inaccurate', 'Neutral', 'Moderately Accurate', 'Accurate'] } },
  
  // Add missing filler and openness questions (Q35-Q58 from CSV) - continuing from ID 38
  {
    id: 38,
    key: 'FILLER_4',
    type: 'statement',
    title: "Halfway done with this section.",
    description: "You're doing great!",
    required: false
  },
  
  // Big Five Openness Questions (Q35-Q58 from CSV)
  { id: 39, key: 'q35', type: 'likert', title: "I have a vivid imagination.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 40, key: 'q36', type: 'likert', title: "I enjoy wild flights of fantasy.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 41, key: 'q37', type: 'likert', title: "I love to daydream.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 42, key: 'q38', type: 'likert', title: "I like to get lost in thought.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 43, key: 'q39', type: 'likert', title: "I believe in the importance of art.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 44, key: 'q40', type: 'likert', title: "I see beauty in things that others might not notice.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 45, key: 'q41', type: 'likert', title: "I do not like poetry.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 46, key: 'q42', type: 'likert', title: "I do not enjoy going to art museums.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 47, key: 'q43', type: 'likert', title: "I experience my emotions intensely.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 48, key: 'q44', type: 'likert', title: "I feel others' emotions.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 49, key: 'q45', type: 'likert', title: "I rarely notice my emotional reactions.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 50, key: 'q46', type: 'likert', title: "I don't understand people who get emotional.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 51, key: 'q47', type: 'likert', title: "I prefer variety to routine.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 52, key: 'q48', type: 'likert', title: "I prefer to stick with things that I know.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 53, key: 'q49', type: 'likert', title: "I dislike changes.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 54, key: 'q50', type: 'likert', title: "I am attached to conventional ways.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 55, key: 'q51', type: 'likert', title: "I love to read challenging material.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 56, key: 'q52', type: 'likert', title: "I avoid philosophical discussions.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 57, key: 'q53', type: 'likert', title: "I have difficulty understanding abstract ideas.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 58, key: 'q54', type: 'likert', title: "I am not interested in theoretical discussions.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 59, key: 'q55', type: 'likert', title: "I spend time daydreaming.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 60, key: 'q56', type: 'likert', title: "I like to solve complex problems.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 61, key: 'q57', type: 'likert', title: "I feel others' emotions.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },
  { id: 62, key: 'q58', type: 'likert', title: "I prefer to stick to familiar routines.", required: true, config: { min: 1, max: 5, labels: ['Very Inaccurate', 'Moderately Inaccurate', 'Neither Accurate nor Inaccurate', 'Moderately Accurate', 'Very Accurate'] } },

  // Transition filler
  {
    id: 63,
    key: 'FILLER_5',
    type: 'statement',
    title: "Great. We've got a clear picture of how you work.",
    required: false
  },

  // RIASEC Vocational Interest Questions (Q59-Q61 from CSV)
  {
    id: 64,
    key: 'FILLER_6',
    type: 'statement',
    title: "Great. Now I'd like to learn more about your interests.",
    description: "I'll show you three lists of activities, one after the other. How would you feel about doing each of the following activities? Focus ONLY on whether you'd enjoy the activity, ignore salary/skills. Do not overthink please!",
    required: false
  },

  // RIASEC Activity Set 1 (Q59)
  {
    id: 65,
    key: 'q59',
    type: 'nested_rating',
    title: "Rate each activity (0-4).",
    required: true,
    config: {
      min: 0,
      max: 4,
      labels: ['Strongly dislike', 'Dislike', 'Unsure', 'Like', 'Strongly like'],
      items: [
        { id: 'activity_1', label: 'Build kitchen cabinets' },
        { id: 'activity_2', label: 'Develop a new medicine' },
        { id: 'activity_3', label: 'Write books or plays' },
        { id: 'activity_4', label: 'Help people with personal or emotional problems' },
        { id: 'activity_5', label: 'Manage a department within a large company' },
        { id: 'activity_6', label: 'Install software across computers on a large network' },
        { id: 'activity_7', label: 'Repair household appliances' },
        { id: 'activity_8', label: 'Study ways to reduce water pollution' },
        { id: 'activity_9', label: 'Compose or arrange music' },
        { id: 'activity_10', label: 'Give career guidance to people' }
      ]
    }
  },

  // RIASEC Activity Set 2 (Q60)
  {
    id: 66,
    key: 'q60',
    type: 'nested_rating',
    title: "Rate each activity (0-4).",
    required: true,
    config: {
      min: 0,
      max: 4,
      labels: ['Strongly dislike', 'Dislike', 'Unsure', 'Like', 'Strongly like'],
      items: [
        { id: 'activity_11', label: 'Start your own business' },
        { id: 'activity_12', label: 'Operate a calculator' },
        { id: 'activity_13', label: 'Assemble electronic parts' },
        { id: 'activity_14', label: 'Conduct chemical experiments' },
        { id: 'activity_15', label: 'Create special effects for movies' },
        { id: 'activity_16', label: 'Perform rehabilitation therapy' },
        { id: 'activity_17', label: 'Negotiate business contracts' },
        { id: 'activity_18', label: 'Keep shipping and receiving records' },
        { id: 'activity_19', label: 'Drive a truck to deliver packages to offices and homes' },
        { id: 'activity_20', label: 'Examine blood samples using a microscope' }
      ]
    }
  },

  // RIASEC Activity Set 3 (Q61)
  {
    id: 67,
    key: 'q61',
    type: 'nested_rating',
    title: "Last set! Rate each activity (0-4).",
    required: true,
    config: {
      min: 0,
      max: 4,
      labels: ['Strongly dislike', 'Dislike', 'Unsure', 'Like', 'Strongly like'],
      items: [
        { id: 'activity_21', label: 'Paint sets for plays' },
        { id: 'activity_22', label: 'Do volunteer work at a non-profit organization' },
        { id: 'activity_23', label: 'Market a new line of clothing' },
        { id: 'activity_24', label: 'Inventory supplies using a hand-held computer' },
        { id: 'activity_25', label: 'Test the quality of parts before shipment' },
        { id: 'activity_26', label: 'Develop a way to better predict the weather' },
        { id: 'activity_27', label: 'Write scripts for movies or television shows' },
        { id: 'activity_28', label: 'Teach a high-school class' },
        { id: 'activity_29', label: 'Sell merchandise at a department store' },
        { id: 'activity_30', label: 'Stamp, sort, and distribute mail for an organization' }
      ]
    }
  },

  // RIASEC Results Filler
  {
    id: 68,
    key: 'FILLER_6_RESULTS',
    type: 'statement',
    title: "Based on your answers, your two main profiles are:",
    description: "1. [TOP AREA NAME]\n2. [SECOND AREA NAME]\n\nDon't worry, I'll further explain what that means in the final report.",
    required: false
  },

  // Campus Profile Section (Q62 from CSV)
  {
    id: 69,
    key: 'FILLER_7',
    type: 'statement',
    title: "Let's figure out what kind of campus environment fits you best.",
    description: "Israel has everything from intense research universities in major cities to smaller campuses with tight-knit communities. Let's find your match!",
    required: false
  },

  {
    id: 70,
    key: 'q62',
    type: 'multi_select',
    title: "From the factors listed below, select the most important for your university choice.",
    description: "Please select at least 3 and no more than 7.",
    required: true,
    config: {
      minSelections: 3,
      maxSelections: 7,
      options: [
        { value: 'library_resources', label: 'Quality library resources and study materials' },
        { value: 'study_spaces', label: 'Availability of quiet study spaces' },
        { value: 'academic_support', label: 'Academic advising and tutoring support' },
        { value: 'international_community', label: 'Large international student community' },
        { value: 'collaborative_community', label: 'Collaborative students community' },
        { value: 'social_events', label: 'Frequent social events and activities' },
        { value: 'gym_sports', label: 'Gym and sports facilities' },
        { value: 'dining_options', label: 'Quality dining options' },
        { value: 'housing_quality', label: 'Good student housing quality' },
        { value: 'prayer_spaces', label: 'Prayer spaces and religious accommodations' },
        { value: 'dietary_options', label: 'Dietary options (vegan, kosher, vegetarian, etc.)' },
        { value: 'career_counseling', label: 'Career counseling and job search support' },
        { value: 'internship_opportunities', label: 'Internship and industry connection opportunities' },
        { value: 'alumni_network', label: 'Strong alumni network' },
        { value: 'small_campus', label: 'A small campus' },
        { value: 'large_campus', label: 'A large campus' },
        { value: 'urban_setting', label: 'An urban setting' },
        { value: 'suburban_rural', label: 'A suburban or rural setting' }
      ]
    }
  },

  // City Profile Section (Q63 from CSV)
  {
    id: 71,
    key: 'FILLER_8',
    type: 'statement',
    title: "Let's look at the cities where you could live.",
    description: "Big city life? Or more quiet and closer to nature? Your preferences will guide the recommendations.",
    required: false
  },

  {
    id: 72,
    key: 'q63',
    type: 'multi_select',
    title: "From the factors listed below, select the most important for your university choice (up to 5):",
    required: true,
    config: {
      minSelections: 1,
      maxSelections: 5,
      options: [
        { value: 'large_city', label: 'A large city' },
        { value: 'small_city', label: 'A small city' },
        { value: 'affordable_living', label: 'Affordable cost of living' },
        { value: 'affordable_housing', label: 'Affordable housing options' },
        { value: 'public_transport', label: 'Quality public transportation' },
        { value: 'walkable_bike', label: 'Walkable/bike-friendly city' },
        { value: 'airport_access', label: 'Easy airport access' },
        { value: 'cultural_venues', label: 'Museums, arts, cultural venues' },
        { value: 'nightlife_restaurants', label: 'Vibrant nightlife and restaurants' },
        { value: 'expat_community', label: 'International/expat community presence' },
        { value: 'center_israel', label: 'Closer to the center of Israel' },
        { value: 'north_israel', label: 'Closer to the North of Israel' },
        { value: 'south_israel', label: 'Closer to the South of Israel' }
      ]
    }
  },

  // Prerequisites Section
  {
    id: 73,
    key: 'FILLER_9',
    type: 'statement',
    title: "Almost there.",
    description: "Last section: The practical stuff - budget, visa requirements, health needs, etc. This ensures we only recommend programs that actually work for you.",
    required: false
  },

  // Age (Q64)
  {
    id: 74,
    key: 'q64',
    type: 'dropdown',
    title: "How old are you?",
    required: true,
    config: {
      options: [
        { value: '17_or_less', label: '17 or less' },
        { value: '18', label: '18' },
        { value: '19_21', label: '19-21' },
        { value: '22_24', label: '22-24' },
        { value: '25_or_older', label: '25 or older' }
      ]
    }
  },

  // Budget (Q65)
  {
    id: 75,
    key: 'q65',
    type: 'dropdown',
    title: "What is your total annual budget for university (tuition + living costs)?",
    required: true,
    config: {
      options: [
        { value: 'under_5000', label: 'Under $5,000/year' },
        { value: '5000_10000', label: '$5,000 - $10,000/year' },
        { value: '10000_15000', label: '$10,000 - $15,000/year' },
        { value: '15000_20000', label: '$15,000 - $20,000/year' },
        { value: '20000_30000', label: '$20,000 - $30,000/year' },
        { value: 'over_30000', label: 'Over $30,000/year' }
      ]
    }
  },

  // Scholarship needs (Q66)
  {
    id: 76,
    key: 'q66',
    type: 'dropdown',
    title: "Do you require scholarship/financial aid to attend?",
    required: true,
    config: {
      options: [
        { value: 'no', label: 'No' },
        { value: 'partial', label: 'Partial' },
        { value: 'full', label: 'Full' }
      ]
    }
  },

  // Scholarship amount (Q67) - conditional
  {
    id: 77,
    key: 'q67',
    type: 'currency',
    title: "What is the minimum scholarship amount needed per year?",
    required: true,
    showIf: {
      questionId: 76,
      operator: 'in',
      value: ['partial', 'full']
    },
    config: {
      currency: 'USD',
      minAmount: 0,
      maxAmount: 50000
    }
  },

  // Health conditions (Q68)
  {
    id: 78,
    key: 'q68',
    type: 'dropdown',
    title: "Do you have pre-existing health conditions requiring ongoing care?",
    required: true,
    config: {
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  },

  // Health condition details (Q69) - conditional
  {
    id: 79,
    key: 'q69',
    type: 'text_field',
    title: "If yes, specify condition(s)",
    required: true,
    showIf: {
      questionId: 78,
      operator: 'equals',
      value: 'yes'
    },
    config: {
      placeholder: 'Please describe your health conditions',
      maxLength: 500
    }
  },

  // Mental health support (Q70)
  {
    id: 80,
    key: 'q70',
    type: 'dropdown',
    title: "Do you have mental health needs requiring support services?",
    required: true,
    config: {
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  },

  // Disabilities (Q71)
  {
    id: 81,
    key: 'q71',
    type: 'dropdown',
    title: "Do you have disabilities requiring campus/housing accommodations?",
    required: true,
    config: {
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  },

  // Disability details (Q72) - conditional
  {
    id: 82,
    key: 'q72',
    type: 'text_field',
    title: "If yes, specify type",
    required: true,
    showIf: {
      questionId: 81,
      operator: 'equals',
      value: 'yes'
    },
    config: {
      placeholder: 'Please describe accommodation needs',
      maxLength: 500
    }
  },

  // GPA (Q73)
  {
    id: 83,
    key: 'q73',
    type: 'dropdown',
    title: "What is your high school GPA or average grade?",
    required: true,
    config: {
      options: [
        { value: 'below_2_5', label: 'Below 2.5' },
        { value: '2_5_2_9', label: '2.5 - 2.9' },
        { value: '3_0_3_2', label: '3.0 - 3.2' },
        { value: '3_3_3_5', label: '3.3 - 3.5' },
        { value: '3_6_3_8', label: '3.6 - 3.8' },
        { value: '3_9_4_0', label: '3.9 - 4.0' },
        { value: 'dont_know', label: "Don't know yet" }
      ]
    }
  },

  // SAT/Psychometric (Q74)
  {
    id: 84,
    key: 'q74',
    type: 'dropdown',
    title: "What is your SAT/Psychometric score?",
    required: true,
    config: {
      options: [
        { value: 'no_sat', label: "I don't have an SAT score" },
        { value: 'below_1000', label: 'Below 1000' },
        { value: '1000_1100', label: '1000-1100' },
        { value: '1100_1200', label: '1100-1200' },
        { value: '1200_1300', label: '1200-1300' },
        { value: '1300_1400', label: '1300-1400' },
        { value: '1400_plus', label: '1400+' }
      ]
    }
  },

  // Housing needs (Q75)
  {
    id: 85,
    key: 'q75',
    type: 'dropdown',
    title: "Do you require housing or you already have an arrangement?",
    required: true,
    config: {
      options: [
        { value: 'require_housing', label: 'I require housing' },
        { value: 'have_arrangement', label: 'I have an arrangement' }
      ]
    }
  },

  // Housing preference (Q76) - conditional
  {
    id: 86,
    key: 'q76',
    type: 'dropdown',
    title: "What would be your housing preference?",
    required: true,
    showIf: {
      questionId: 85,
      operator: 'equals',
      value: 'require_housing'
    },
    config: {
      options: [
        { value: 'on_campus', label: 'On-campus' },
        { value: 'off_campus', label: 'Off-campus' },
        { value: 'either', label: 'Either one' }
      ]
    }
  },

  // Dietary restrictions (Q77)
  {
    id: 87,
    key: 'q77',
    type: 'dropdown',
    title: "Do you have dietary restrictions?",
    required: true,
    config: {
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  },

  // Dietary details (Q78) - conditional
  {
    id: 88,
    key: 'q78',
    type: 'multi_select',
    title: "If yes, specify:",
    required: true,
    showIf: {
      questionId: 87,
      operator: 'equals',
      value: 'yes'
    },
    config: {
      options: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'allergies', label: 'Allergies' },
        { value: 'kosher', label: 'Kosher' },
        { value: 'other', label: 'Other' }
      ]
    }
  },

  // Start date (Q79)
  {
    id: 89,
    key: 'q79',
    type: 'date',
    title: "When would you like to start your studies?",
    required: true,
    config: {
      format: 'semester',
      options: [
        { value: 'fall_2024', label: 'Fall 2024' },
        { value: 'spring_2025', label: 'Spring 2025' },
        { value: 'fall_2025', label: 'Fall 2025' },
        { value: 'spring_2026', label: 'Spring 2026' },
        { value: 'later', label: 'Later' }
      ]
    }
  },

  // Completion page
  {
    id: 90,
    key: 'COMPLETION',
    type: 'statement',
    title: "You're done!",
    description: "We're processing your results now. We are excited for the opportunities your profile is showing!\n\nHere's what happens next:\n\n1. We match your profile to programs across Israeli universities\n2. We calculate fit scores based on your priorities\n3. We filter by your practical requirements (budget, support needs)\n\nYour personalized recommendations will show:\n- Your Brilliance Profile: your personality-based preferences and what it means for your career\n- Up to three degrees ranked by overall fit\n- Why each program matches you specifically\n- What to expect from each campus and city\n- Next steps to apply\n\nReady?",
    required: false
  }
];
