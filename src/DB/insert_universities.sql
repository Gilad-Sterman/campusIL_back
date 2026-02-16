-- Insert universities for top 30 programs
-- Generated from closest-production-ready-programs.md analysis
-- Run this after DBSetup.sql to populate universities table

INSERT INTO universities (name, city, region, description, website_url, status) VALUES
('Hebrew University', 'Jerusalem', 'Center', 'Premier research university in Jerusalem, Center region. One of Israel''s oldest and most prestigious institutions.', 'https://new.huji.ac.il/en', 'active'),

('Reichman University (IDC)', 'Herzliya', 'Center', 'Private research university in Herzliya, Center region. Known for interdisciplinary programs and international focus.', 'https://www.runi.ac.il/en', 'active'),

('Tel Aviv University', 'Tel Aviv', 'Center', 'Leading research university in Tel Aviv, Center region. Israel''s largest university with comprehensive academic programs.', 'https://www.tau.ac.il/', 'active'),

('Ben-Gurion Universtiy', 'Beer Sheva', 'South', 'Research university in Beer Sheva, South region. Known for desert research, engineering, and life sciences.', 'https://www.bgu.ac.il/', 'active'),

('Haifa University', 'Haifa', 'North', 'Public research university in Haifa, North region. Known for social sciences, education, and multicultural programs.', 'https://www.haifa.ac.il/', 'active');

-- Note: Optional fields left as NULL:
-- - application_url (can be added later)
-- - logo_url (can be added later) 
-- - image_url (can be added later)
-- - tuition_avg_usd (can be added later)
-- - tuition_usd (can be added later)
-- - living_cost_usd (can be added later)
-- - languages (can be added later)
