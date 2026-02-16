-- Insert programs from Tier 1 (only missing Basic Description)
-- Generated from closest-production-ready-programs.md analysis
-- Run this after insert_universities.sql

-- University IDs provided:
-- Tel Aviv University: d4bffbb5-c08d-4419-8b7e-f0346e7420dc
-- Ben-Gurion University: 8a456ccc-f0ee-4ced-88c1-3552638fba7e  
-- Haifa University: cc15c963-e1f7-444b-a209-4ab525b43131
-- Reichman University (IDC): d4308adf-17e5-461f-8566-389d37e4ac04
-- Hebrew University: 04efd7bd-33ae-488b-9972-7365029974d0

INSERT INTO programs (
    university_id, 
    name, 
    degree_level, 
    field, 
    discipline, 
    domain, 
    description, 
    duration_years, 
    application_url, 
    tuition_usd, 
    doc_requirements, 
    status
) VALUES

-- 1) Business Administration & English - Double Major (BA) — Hebrew University
('04efd7bd-33ae-488b-9972-7365029974d0', 
 'Business Administration & English - Double Major', 
 'bachelor', 
 'Business, Management, Communications & Economics', 
 'Business Administration & English - Double Major', 
 'Power, Policy & Influence', 
 'Interdisciplinary double major combining business administration fundamentals with English language and literature studies, preparing students for leadership roles in international business and communications.',
 3, 
 'https://overseas.huji.ac.il/admissions/apply-now/apply-now-ba/', 
 15620, 
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'], 
 'active'),

-- 2) Business Administration & Liberal Arts - Double Major (BA) — Hebrew University  
('04efd7bd-33ae-488b-9972-7365029974d0', 
 'Business Administration & Liberal Arts - Double Major', 
 'bachelor', 
 'Business, Management, Communications & Economics', 
 'Business Administration & Liberal Arts - Double Major', 
 'Future Builders', 
 'Comprehensive double major program integrating business administration principles with liberal arts education, fostering critical thinking and leadership skills for diverse career paths.',
 3, 
 'https://overseas.huji.ac.il/admissions/apply-now/apply-now-ba/', 
 15620, 
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'], 
 'active'),

-- 3) English & Liberal Arts - Double Major (BA) — Hebrew University
('04efd7bd-33ae-488b-9972-7365029974d0', 
 'English & Liberal Arts - Double Major', 
 'bachelor', 
 'English & Lingustics', 
 'English & Liberal Arts - Double Major', 
 'Culture & Creativity', 
 'Dynamic double major combining English language and literature studies with liberal arts education, developing analytical and communication skills for careers in education, media, and cultural sectors.',
 3, 
 'https://overseas.huji.ac.il/admissions/apply-now/apply-now-ba/', 
 15620, 
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'], 
 'active'),

-- TIER 2: Missing Duration (Years) - 21 programs
-- Standard durations used: Bachelor=4, Master=2, MBA=2, MFA=2, BMus/MMus=4

-- Reichman University (IDC) Bachelor Programs

-- 4) Economics, Entrepreneurship & Data Science (BSc) — Reichman University (IDC)
('d4308adf-17e5-461f-8566-389d37e4ac04',
 'Economics, Entrepreneurship & Data Science',
 'bachelor',
 'Business, Management, Communications & Economics',
 'Economics, Entrepreneurship & Data Science',
 'Future Builders',
 'Interdisciplinary program combining economics, entrepreneurship, and data science to prepare students for innovation-driven careers in business and technology.',
 4,
 'https://www.runi.ac.il/en/admissions/undergraduate-programs/',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 5) Entrepreneurship & Computer Science (BSc) — Reichman University (IDC)
('d4308adf-17e5-461f-8566-389d37e4ac04',
 'Entrepreneurship & Computer Science',
 'bachelor',
 'Computer Science & Technology',
 'Entrepreneurship & Computer Science',
 'Future Builders',
 'Innovative program merging computer science fundamentals with entrepreneurship skills, preparing students to launch tech startups and lead digital transformation.',
 4,
 'https://www.runi.ac.il/en/admissions/undergraduate-programs/',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 6) Business & Economics - Double Major (BA) — Reichman University (IDC)
('d4308adf-17e5-461f-8566-389d37e4ac04',
 'Business & Economics - Double Major',
 'bachelor',
 'Business, Management, Communications & Economics',
 'Business & Economics - Double Major',
 'Power, Policy & Influence',
 'Comprehensive double major combining business administration with economic theory and analysis, preparing students for leadership roles in finance and business strategy.',
 4,
 'https://www.runi.ac.il/en/admissions/undergraduate-programs/',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 7) Communications (BSc) — Reichman University (IDC)
('d4308adf-17e5-461f-8566-389d37e4ac04',
 'Communications',
 'bachelor',
 'Business, Management, Communications & Economics',
 'Communications',
 'Power, Policy & Influence',
 'Dynamic communications program focusing on digital media, strategic communication, and public relations in the modern information landscape.',
 4,
 'https://www.runi.ac.il/en/admissions/undergraduate-programs/',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 8) Sustainability & Government (double major) (BSc + BA) — Reichman University (IDC)
('d4308adf-17e5-461f-8566-389d37e4ac04',
 'Sustainability & Government (double major)',
 'bachelor',
 'Government & Political Science',
 'Sustainability & Government (double major)',
 'Power, Policy & Influence',
 'Interdisciplinary double major addressing environmental sustainability and governance challenges, preparing students for careers in policy, environmental consulting, and public administration.',
 4,
 'https://www.runi.ac.il/en/admissions/undergraduate-programs/',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- Tel Aviv University Bachelor Programs

-- 9) The Buchmann-Mehta School of Music International Program (BMus) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'The Buchmann-Mehta School of Music International Program',
 'bachelor',
 'Music & Performing Arts',
 'The Buchmann-Mehta School of Music International Program',
 'Culture & Creativity',
 'Prestigious international music program offering comprehensive training in performance, composition, and music theory at one of Israel''s leading music institutions.',
 4,
 'https://en-music.tau.ac.il/admissions',
 18000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 10) Management & Liberal Arts (BA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Management & Liberal Arts',
 'bachelor',
 'Business, Management, Communications & Economics',
 'Management & Liberal Arts',
 'Power, Policy & Influence',
 'Interdisciplinary program combining management principles with liberal arts education, developing critical thinking and leadership skills for diverse business environments.',
 4,
 'https://international.tau.ac.il/programs/undergraduate',
 18000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 11) Dual Degree Liberal Arts Program: TAU & Columbia University (BA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Dual Degree Liberal Arts Program: TAU & Columbia University',
 'bachelor',
 'Liberal Arts & General Studies',
 'Dual Degree Liberal Arts Program: TAU & Columbia University',
 'Culture & Creativity',
 'Unique dual degree program offering students the opportunity to study at both Tel Aviv University and Columbia University, providing a truly international liberal arts education.',
 4,
 'https://international.tau.ac.il/programs/undergraduate',
 25000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 12) Liberal Arts (BA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Liberal Arts',
 'bachelor',
 'Liberal Arts & General Studies',
 'Liberal Arts',
 'Culture & Creativity',
 'Comprehensive liberal arts program fostering critical thinking, cultural awareness, and interdisciplinary learning across humanities, social sciences, and arts.',
 4,
 'https://international.tau.ac.il/programs/undergraduate',
 18000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- Master's Programs

-- 13) International Relations with Warsaw University (MA) — Haifa University
('cc15c963-e1f7-444b-a209-4ab525b43131',
 'International Relations with Warsaw University',
 'master',
 'Government & Political Science',
 'International Relations with Warsaw University',
 'Power, Policy & Influence',
 'Joint master''s program with Warsaw University focusing on international relations, diplomacy, and European-Middle Eastern political dynamics.',
 2,
 'https://www.haifa.ac.il/index.php/en/admissions',
 16000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- Tel Aviv University Master's Programs

-- 14) Music International Program at the Buchmann‑Mehta School of Music (MMus) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Music International Program at the Buchmann‑Mehta School of Music',
 'master',
 'Music & Performing Arts',
 'Music International Program at the Buchmann‑Mehta School of Music',
 'Culture & Creativity',
 'Advanced graduate program in music performance, composition, and musicology at Israel''s premier music institution, offering world-class training and performance opportunities.',
 4,
 'https://en-music.tau.ac.il/admissions',
 20000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 15) Coller Deep Tech (MBA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Coller Deep Tech',
 'master',
 'Business, Management, Communications & Economics',
 'Coller Deep Tech',
 'Future Builders',
 'Specialized MBA program focusing on deep technology ventures, innovation management, and tech entrepreneurship in emerging markets.',
 2,
 'https://coller.tau.ac.il/MBA',
 35000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 16) Sofaer Global (MBA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Sofaer Global',
 'master',
 'Business, Management, Communications & Economics',
 'Sofaer Global',
 'Power, Policy & Influence',
 'International MBA program with global perspective, focusing on leadership, strategy, and cross-cultural business management.',
 2,
 'https://coller.tau.ac.il/MBA',
 35000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 17) Documentary Cinema (MFA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Documentary Cinema',
 'master',
 'Film & Media Studies',
 'Documentary Cinema',
 'Culture & Creativity',
 'Master of Fine Arts program in documentary filmmaking, combining theoretical knowledge with hands-on production experience in non-fiction storytelling.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 18) Musicology (MMus) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Musicology',
 'master',
 'Music & Performing Arts',
 'Musicology',
 'Culture & Creativity',
 'Advanced graduate program in musicology combining historical research, theoretical analysis, and cultural studies of music across different periods and traditions.',
 4,
 'https://en-music.tau.ac.il/admissions',
 20000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 19) Biomedical Engineering (MSc) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Biomedical Engineering',
 'master',
 'Engineering & Technology',
 'Biomedical Engineering',
 'Future Builders',
 'Advanced master''s program in biomedical engineering, focusing on medical device development, biotechnology, and healthcare innovation.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 24000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 20) Environmental Studies (MA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Environmental Studies',
 'master',
 'Environmental Science & Sustainability',
 'Environmental Studies',
 'Future Builders',
 'Interdisciplinary master''s program addressing environmental challenges through scientific research, policy analysis, and sustainable development strategies.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 20000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 21) Sustainable Development (MA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Sustainable Development',
 'master',
 'Environmental Science & Sustainability',
 'Sustainable Development',
 'Future Builders',
 'Master''s program focusing on sustainable development principles, environmental policy, and social responsibility in global development contexts.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 20000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 22) Conflict Resolution and Mediation (MA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Conflict Resolution and Mediation',
 'master',
 'Government & Political Science',
 'Conflict Resolution and Mediation',
 'Power, Policy & Influence',
 'Specialized master''s program in conflict resolution, mediation techniques, and peacebuilding strategies for international and domestic disputes.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 18000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 23) Cyber Politics & Government (MA) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Cyber Politics & Government',
 'master',
 'Government & Political Science',
 'Cyber Politics & Government',
 'Power, Policy & Influence',
 'Cutting-edge master''s program examining the intersection of cybersecurity, digital governance, and political science in the digital age.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 22000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active'),

-- 24) Disaster Management (MDM) — Tel Aviv University
('d4bffbb5-c08d-4419-8b7e-f0346e7420dc',
 'Disaster Management',
 'master',
 'Emergency Management & Public Safety',
 'Disaster Management',
 'Human Insight & Impact',
 'Specialized master''s program in disaster management, emergency response, and crisis leadership for natural and human-made disasters.',
 2,
 'https://international.tau.ac.il/programs/graduate',
 20000,
 ARRAY['high_school_transcript', 'passport', 'resume', 'personal_statement', 'recommendation_letters'],
 'active');

-- Note: All programs use default doc_requirements array based on application.service.js fallback
-- Tier 1 (3 programs) were missing only Basic Description, now complete for DB insertion
-- Tier 2 (21 programs) were missing only Duration, now complete for DB insertion
-- Standard durations applied: Bachelor=4 years, Master=2 years, MBA=2 years, MFA=2 years, BMus/MMus=4 years
