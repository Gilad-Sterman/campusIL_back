export const V3_QUIZ_QUESTIONS = [
  // --- INITIAL ---
  {
    id: 1,
    key: 'student_name',
    type: 'text_field',
    title: "What's your first name?",
    required: true,
    config: { placeholder: 'Enter your name', maxLength: 100 }
  },
  {
    id: 2,
    key: 'student_degree_level',
    type: 'single_select',
    title: "What level of degree are you looking for?",
    required: true,
    config: {
      options: [
        { value: 'BA/BSc', label: "Bachelor's degree (BA/BSc)" },
        { value: 'MA/MSc/MBA', label: "Master's degree (MA/MSc/MBA)" }
      ]
    }
  },
  {
    id: 3,
    key: 'MEET_NAME',
    type: 'statement',
    title: "Nice to meet you. Let's get to know each other.",
    required: false
  },
  {
    id: 4,
    key: 'student_headline',
    type: 'single_select',
    title: "Imagine a journalist writes a story about you in 10 years. What's the headline?",
    required: false,
    config: {
      options: [
        { value: 'HEADLINE_BUILT', label: 'Built something from nothing' },
        { value: 'HEADLINE_CHANGED', label: 'Changed the rules of the game' },
        { value: 'HEADLINE_UNDERSTOOD', label: 'Understood the world better than anyone' },
        { value: 'HEADLINE_HELPED', label: 'Made other people\'s lives better' },
        { value: 'HEADLINE_UNKNOWN', label: 'I don\'t know yet' }
      ],
      allowCustom: true
    }
  },
  {
    id: 5,
    key: 'student_values',
    type: 'multi_select',
    title: "What matters most to you? Pick your top 3.",
    required: true,
    config: {
      minSelections: 3,
      maxSelections: 3,
      options: [
        { value: 'VAL_ACHIEVEMENT', label: 'Achievement & recognition' },
        { value: 'VAL_ADVENTURE', label: 'Adventure & new experiences' },
        { value: 'VAL_KNOWLEDGE', label: 'Knowledge & understanding' },
        { value: 'VAL_GROWTH', label: 'Personal growth' },
        { value: 'VAL_RELATIONSHIPS', label: 'Close relationships' },
        { value: 'VAL_FREEDOM', label: 'Freedom & independence' },
        { value: 'VAL_STABILITY', label: 'Stability & security' },
        { value: 'VAL_CREATIVE', label: 'Creative expression' },
        { value: 'VAL_DIFFERENCE', label: 'Making a difference' },
        { value: 'VAL_BELONGING', label: 'Belonging to a community' }
      ]
    }
  },
  {
    id: 6,
    key: 'EXPLORE_WORK',
    type: 'statement',
    title: "Now let's explore the kind of work that energizes you.",
    description: "The next questions come from the O*NET Interest Profiler, a tool used by millions of people to understand their career strengths. For each activity, tell us how much you'd enjoy doing it.",
    config: {
      steps: [
        "Ignore education requirements and money.",
        "Just focus on interest.",
        "Go with your gut instinct."
      ]
    },
    required: false
  },

  // --- RIASEC BLOCK 1 (ID 7-14) ---
  {
    id: 7,
    key: 'RIASEC_R_01',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Build kitchen cabinets',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 8,
    key: 'RIASEC_I_01',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Study ways to reduce water pollution',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 9,
    key: 'RIASEC_A_01',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Write scripts for movies or television shows',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 10,
    key: 'RIASEC_S_01',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Help people with personal or emotional problems',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 11,
    key: 'RIASEC_E_01',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Manage a retail store',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 12,
    key: 'RIASEC_C_01',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Develop a spreadsheet using computer software',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 13,
    key: 'RIASEC_R_02',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Assemble electronic parts',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 14,
    key: 'RIASEC_I_02',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Conduct chemical experiments',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 15,
    key: 'EXPLORE_PERSONALITY',
    type: 'statement',
    title: "Great, thanks.",
    description: "Now, let’s take the time to explore your personality and thinking style, from the widely used IPIP personality research project. Please tell us how much each statement sounds like you. Don’t overthink it.",
    required: false
  },

  // --- OPENNESS BLOCK 1 (ID 16-25) ---
  {
    id: 16,
    key: 'O_O1_01',
    type: 'likert',
    title: '"How much does this sound like you?" I have a vivid imagination',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 17,
    key: 'O_O2_01',
    type: 'likert',
    title: '"How much does this sound like you?" I believe in the importance of art',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 18,
    key: 'O_O3_01',
    type: 'likert',
    title: '"How much does this sound like you?" I experience my emotions intensely',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 19,
    key: 'O_O4_01',
    type: 'likert',
    title: '"How much does this sound like you?" I prefer variety to routine',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 20,
    key: 'O_O1_02',
    type: 'likert',
    title: '"How much does this sound like you?" I enjoy wild flights of fantasy',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 21,
    key: 'O_O2_02',
    type: 'likert',
    title: '"How much does this sound like you?" I see beauty in things that others might not notice',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 22,
    key: 'O_O3_02',
    type: 'likert',
    title: '"How much does this sound like you?" I feel others\' emotions',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 23,
    key: 'O_O4_02',
    type: 'likert',
    title: '"How much does this sound like you?" I seek adventure',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 24,
    key: 'O_O1_03',
    type: 'likert',
    title: '"How much does this sound like you?" I love to daydream',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 25,
    key: 'O_O2_03',
    type: 'likert',
    title: '"How much does this sound like you?" I love flowers and enjoy the beauty of nature',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 26,
    key: 'DOING_GREAT',
    type: 'statement',
    title: "You’re doing great.",
    description: "Tell us more.",
    required: false
  },

  // --- RIASEC BLOCK 2 (ID 27-33) ---
  {
    id: 27,
    key: 'RIASEC_A_02',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Design artwork for magazines',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 28,
    key: 'RIASEC_S_02',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Teach an adult to read',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 29,
    key: 'RIASEC_E_02',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Sell merchandise at a department store',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 30,
    key: 'RIASEC_C_02',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Proofread records or forms',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 31,
    key: 'RIASEC_R_03',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Repair household appliances',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 32,
    key: 'RIASEC_I_03',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Develop a new medical treatment or procedure',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 33,
    key: 'RIASEC_A_03',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Compose or arrange music',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 34,
    key: 'ALMOST_THERE',
    type: 'statement',
    title: "Almost there.",
    required: false
  },

  // --- OPENNESS BLOCK 2 (ID 35-44) ---
  {
    id: 35,
    key: 'O_O1_04',
    type: 'likert',
    title: '"How much does this sound like you?" I like to get lost in thought',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 36,
    key: 'O_O3_03',
    type: 'likert',
    title: '"How much does this sound like you?" I enjoy examining myself and my life',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 37,
    key: 'O_O4_03',
    type: 'likert',
    title: '"How much does this sound like you?" I like to begin new things',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 38,
    key: 'O_O5_01',
    type: 'likert',
    title: '"How much does this sound like you?" I love to read challenging material',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 39,
    key: 'O_O3_04',
    type: 'likert',
    title: '"How much does this sound like you?" I am passionate about causes',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 40,
    key: 'O_O4_04',
    type: 'likert',
    title: '"How much does this sound like you?" I like to visit new places',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 41,
    key: 'O_O5_02',
    type: 'likert',
    title: '"How much does this sound like you?" I love to think up new ways of doing things',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 42,
    key: 'O_O5_03',
    type: 'likert',
    title: '"How much does this sound like you?" I enjoy hearing new ideas',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 43,
    key: 'O_O5_04',
    type: 'likert',
    title: '"How much does this sound like you?" I can handle a lot of information',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 44,
    key: 'O_O2_04',
    type: 'likert',
    title: '"How much does this sound like you?" I love beautiful things',
    required: true,
    config: { min: 0, max: 2, labels: ['Not me', 'Maybe', "That's me"] }
  },
  {
    id: 45,
    key: 'TWO_MORE',
    type: 'statement',
    title: "Two more sections to go.",
    required: false
  },

  // --- RIASEC BLOCK 3 (ID 46-53) ---
  {
    id: 46,
    key: 'RIASEC_S_03',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Do volunteer work at a non-profit organization',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 47,
    key: 'RIASEC_E_03',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Start your own business',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 48,
    key: 'RIASEC_C_03',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Record business transactions and keep financial records',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 49,
    key: 'RIASEC_R_04',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Test the quality of parts before shipment',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 50,
    key: 'RIASEC_I_04',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Study the movement of planets',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 51,
    key: 'RIASEC_A_04',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Act in a movie',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 52,
    key: 'RIASEC_S_04',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Give career guidance to people',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 53,
    key: 'RIASEC_E_04',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Negotiate business contracts',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 54,
    key: 'LAST_ROUND',
    type: 'statement',
    title: "Last round of activities.",
    required: false
  },

  // --- RIASEC BLOCK 4 (ID 55-61) ---
  {
    id: 55,
    key: 'RIASEC_C_04',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Operate a calculator',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 56,
    key: 'RIASEC_R_05',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Lay brick or tile',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 57,
    key: 'RIASEC_I_05',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Examine blood samples using a microscope',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 58,
    key: 'RIASEC_A_05',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Play a musical instrument',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 59,
    key: 'RIASEC_S_05',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Supervise the activities of children at a camp',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 60,
    key: 'RIASEC_E_05',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Give talks or speeches',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 61,
    key: 'RIASEC_C_05',
    type: 'likert',
    title: '"How much would you enjoy this activity?" Record rent payments',
    required: true,
    config: { min: 0, max: 4, labels: ['Strongly Dislike', 'Dislike', 'Unsure', 'Like', 'Strongly Like'] }
  },
  {
    id: 62,
    key: 'STUDENT_EXPERIENCE',
    type: 'statement',
    title: "Now that we’ve gotten to know you, let’s focus on your student experience.",
    required: false
  },

  // --- FINAL SECTION ---
  {
    id: 63,
    key: 'student_campus_factors',
    type: 'multi_select',
    title: "What matters most in a campus? Select 3-7.",
    required: true,
    config: {
      minSelections: 3,
      maxSelections: 7,
      options: [
        { value: 'CAMPUS_LIBRARY', label: 'Great library & study spaces' },
        { value: 'CAMPUS_SUPPORT', label: 'Academic advising & tutoring' },
        { value: 'CAMPUS_INTLSTUDENTS', label: 'International student community' },
        { value: 'CAMPUS_SOCIAL', label: 'Social events & activities' },
        { value: 'CAMPUS_GYM', label: 'Gym & sports facilities' },
        { value: 'CAMPUS_DINING', label: 'Quality dining' },
        { value: 'CAMPUS_HOUSING', label: 'Good student housing' },
        { value: 'CAMPUS_CAREER', label: 'Career counseling' },
        { value: 'CAMPUS_INTERNSHIP', label: 'Internship connections' },
        { value: 'CAMPUS_ALUMNI', label: 'Strong alumni network' }
      ]
    }
  },
  {
    id: 64,
    key: 'student_priority',
    type: 'single_select',
    title: "What matters most in your university experience?",
    required: true,
    config: {
      options: [
        { value: 'PRIORITY_ACADEMIC', label: 'Quality learning and academic excellence' },
        { value: 'PRIORITY_SOCIAL', label: 'Social life and community' },
        { value: 'PRIORITY_CAREER', label: 'Alumni/ae network and career opportunities' }
      ]
    }
  },
  {
    id: 65,
    key: 'student_motivation',
    type: 'single_select',
    title: "What's most appealing about studying a full degree in Israel?",
    required: false,
    config: {
      options: [
        { value: 'MOTIVE_CULTURAL', label: 'Cultural immersion and new experiences' },
        { value: 'MOTIVE_ACADEMIC', label: 'Academic programs I can\'t find elsewhere' },
        { value: 'MOTIVE_CAREER', label: 'Building a career in Israel or the Middle East' },
        { value: 'MOTIVE_JEWISH', label: 'Connection to Jewish identity and heritage' }
      ],
      allowCustom: true
    }
  },
  {
    id: 66,
    key: 'LAST_QUESTION',
    type: 'statement',
    title: "Last question.",
    description: "Take a moment to think about this one.",
    required: false
  },
  {
    id: 67,
    key: 'student_vision',
    type: 'text_field',
    title: "If your degree in Israel goes exactly the way you hope, what does your life look like after graduation?",
    required: false,
    config: { placeholder: 'Your vision here...', maxLength: 1000, multiline: true }
  },
  {
    id: 68,
    key: 'ANALYZED_RESPONSES',
    type: 'statement',
    title: "We analyzed your responses.",
    description: "You will be able to see degree suggestions in your email. After you have had a chance to review, you can book a call with our concierge team.",
    required: false
  }
];
