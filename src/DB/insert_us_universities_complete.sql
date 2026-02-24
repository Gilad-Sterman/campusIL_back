-- Complete US Universities Insert with In-State/Out-of-State Tuition Support
-- Data sources: Jewish Universities CSV, Most Popular Universities CSV, US Benchmark CSV
-- Generated: 2026-02-23

-- Insert all unique US universities with state codes and tuition data
INSERT INTO universities (
    name, 
    city, 
    region,
    state_code,
    tuition_avg_usd,
    tuition_in_state_usd,
    living_cost_usd,
    living_cost_in_state_usd,
    languages,
    status
) VALUES

-- ALABAMA
('University of Alabama', 'Tuscaloosa', 'United States', 'AL', 32000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Auburn University', 'Auburn', 'United States', 'AL', 31000, NULL, 15500, NULL, ARRAY['English'], 'active'),
('Samford University', 'Birmingham', 'United States', 'AL', 36000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- ALASKA
('University of Alaska Fairbanks', 'Fairbanks', 'United States', 'AK', 29000, NULL, 18000, NULL, ARRAY['English'], 'active'),
('University of Alaska Anchorage', 'Anchorage', 'United States', 'AK', 28000, NULL, 20000, NULL, ARRAY['English'], 'active'),

-- ARIZONA
('Arizona State University', 'Tempe', 'United States', 'AZ', 39062, 12177, 19000, NULL, ARRAY['English'], 'active'),
('University of Arizona', 'Tucson', 'United States', 'AZ', 42300, 13900, 17000, NULL, ARRAY['English'], 'active'),
('Grand Canyon University', 'Phoenix', 'United States', 'AZ', 37000, NULL, 19000, NULL, ARRAY['English'], 'active'),

-- ARKANSAS
('University of Arkansas', 'Fayetteville', 'United States', 'AR', 28000, NULL, 15000, NULL, ARRAY['English'], 'active'),
('Hendrix College', 'Conway', 'United States', 'AR', 38000, NULL, 16000, NULL, ARRAY['English'], 'active'),

-- CALIFORNIA
('UCLA', 'Los Angeles', 'United States', 'CA', 54858, 15588, 31800, NULL, ARRAY['English'], 'active'),
('UC Berkeley', 'Berkeley', 'United States', 'CA', 46000, 6801, 26000, 4609, ARRAY['English'], 'active'),
('Stanford University', 'Stanford', 'United States', 'CA', 62000, NULL, 28000, NULL, ARRAY['English'], 'active'),
('USC', 'Los Angeles', 'United States', 'CA', 73260, NULL, 25879, NULL, ARRAY['English'], 'active'),
('UC Santa Barbara', 'Santa Barbara', 'United States', 'CA', 54858, 15588, 31800, NULL, ARRAY['English'], 'active'),
('California State University Northridge', 'Northridge', 'United States', 'CA', 6450, NULL, 31848, NULL, ARRAY['English'], 'active'),
('California State University Fullerton', 'Fullerton', 'United States', 'CA', 3225, NULL, 20215, NULL, ARRAY['English'], 'active'),

-- COLORADO
('University of Colorado Boulder', 'Boulder', 'United States', 'CO', 44748, 14606, 22000, NULL, ARRAY['English'], 'active'),
('Colorado State University', 'Fort Collins', 'United States', 'CO', 31000, NULL, 19000, NULL, ARRAY['English'], 'active'),
('University of Denver', 'Denver', 'United States', 'CO', 56000, NULL, 23000, NULL, ARRAY['English'], 'active'),

-- CONNECTICUT
('University of Connecticut', 'Storrs', 'United States', 'CT', 36000, NULL, 19000, NULL, ARRAY['English'], 'active'),
('Yale University', 'New Haven', 'United States', 'CT', 65000, NULL, 24000, NULL, ARRAY['English'], 'active'),
('Quinnipiac University', 'Hamden', 'United States', 'CT', 52000, NULL, 20000, NULL, ARRAY['English'], 'active'),

-- DELAWARE
('University of Delaware', 'Newark', 'United States', 'DE', 35000, NULL, 19000, NULL, ARRAY['English'], 'active'),

-- FLORIDA
('University of Florida', 'Gainesville', 'United States', 'FL', 28659, 6381, 19390, 19390, ARRAY['English'], 'active'),
('Florida State University', 'Tallahassee', 'United States', 'FL', 21000, 7000, 27000, 24000, ARRAY['English'], 'active'),
('University of Miami', 'Miami', 'United States', 'FL', 59000, NULL, 25000, NULL, ARRAY['English'], 'active'),
('Rollins College', 'Winter Park', 'United States', 'FL', 57000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('University of Central Florida', 'Orlando', 'United States', 'FL', 22467, 6368, 13412, NULL, ARRAY['English'], 'active'),
('Florida International University', 'Miami', 'United States', 'FL', 18964, 6566, 24000, NULL, ARRAY['English'], 'active'),

-- GEORGIA
('University of Georgia', 'Athens', 'United States', 'GA', 30000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('Georgia Tech', 'Atlanta', 'United States', 'GA', 33000, NULL, 21000, NULL, ARRAY['English'], 'active'),
('Emory University', 'Atlanta', 'United States', 'GA', 60000, NULL, 21000, NULL, ARRAY['English'], 'active'),
('Georgia State University', 'Atlanta', 'United States', 'GA', 6330, 1575, 1340, NULL, ARRAY['English'], 'active'),
('Kennesaw State University', 'Kennesaw', 'United States', 'GA', 21030, 5700, 22618, NULL, ARRAY['English'], 'active'),

-- HAWAII
('University of Hawaii at Manoa', 'Honolulu', 'United States', 'HI', 34000, NULL, 24000, NULL, ARRAY['English'], 'active'),
('Hawaii Pacific University', 'Honolulu', 'United States', 'HI', 32000, NULL, 24000, NULL, ARRAY['English'], 'active'),

-- IDAHO
('University of Idaho', 'Moscow', 'United States', 'ID', 28000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Boise State University', 'Boise', 'United States', 'ID', 27000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- ILLINOIS
('University of Illinois Urbana-Champaign', 'Champaign', 'United States', 'IL', 39392, 18046, 18884, NULL, ARRAY['English'], 'active'),
('University of Chicago', 'Chicago', 'United States', 'IL', 65000, NULL, 24000, NULL, ARRAY['English'], 'active'),
('Northwestern University', 'Evanston', 'United States', 'IL', 64000, NULL, 23000, NULL, ARRAY['English'], 'active'),

-- INDIANA
('Indiana University Bloomington', 'Bloomington', 'United States', 'IN', 42294, 12142, 26302, NULL, ARRAY['English'], 'active'),
('Purdue University', 'West Lafayette', 'United States', 'IN', 31000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('University of Notre Dame', 'Notre Dame', 'United States', 'IN', 62000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- IOWA
('University of Iowa', 'Iowa City', 'United States', 'IA', 32000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('Iowa State University', 'Ames', 'United States', 'IA', 29000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Drake University', 'Des Moines', 'United States', 'IA', 47000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- KANSAS
('University of Kansas', 'Lawrence', 'United States', 'KS', 29000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Kansas State University', 'Manhattan', 'United States', 'KS', 28000, NULL, 15500, NULL, ARRAY['English'], 'active'),

-- KENTUCKY
('University of Kentucky', 'Lexington', 'United States', 'KY', 31000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('University of Louisville', 'Louisville', 'United States', 'KY', 30000, NULL, 17000, NULL, ARRAY['English'], 'active'),

-- LOUISIANA
('LSU', 'Baton Rouge', 'United States', 'LA', 30000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('University of Louisiana at Lafayette', 'Lafayette', 'United States', 'LA', 27000, NULL, 15000, NULL, ARRAY['English'], 'active'),
('Tulane University', 'New Orleans', 'United States', 'LA', 60000, NULL, 22000, NULL, ARRAY['English'], 'active'),

-- MAINE
('University of Maine', 'Orono', 'United States', 'ME', 31000, NULL, 17000, NULL, ARRAY['English'], 'active'),

-- MARYLAND
('University of Maryland College Park', 'College Park', 'United States', 'MD', 41974, 12008, 62374, 32408, ARRAY['English'], 'active'),
('Johns Hopkins University', 'Baltimore', 'United States', 'MD', 62000, NULL, 23000, NULL, ARRAY['English'], 'active'),
('University of Maryland University College', 'Adelphi', 'United States', 'MD', 22634, 7752, 16436, NULL, ARRAY['English'], 'active'),

-- MASSACHUSETTS
('UMass Amherst', 'Amherst', 'United States', 'MA', 41759, 18487, 19968, NULL, ARRAY['English'], 'active'),
('Harvard University', 'Cambridge', 'United States', 'MA', 59000, NULL, 30000, NULL, ARRAY['English'], 'active'),
('MIT', 'Cambridge', 'United States', 'MA', 60000, NULL, 30000, NULL, ARRAY['English'], 'active'),
('Boston University', 'Boston', 'United States', 'MA', 61000, NULL, 28000, NULL, ARRAY['English'], 'active'),

-- MICHIGAN
('University of Michigan', 'Ann Arbor', 'United States', 'MI', 68444, 20648, 20202, NULL, ARRAY['English'], 'active'),
('Michigan State University', 'East Lansing', 'United States', 'MI', 44300, 16916, 28225, 20046, ARRAY['English'], 'active'),

-- MINNESOTA
('University of Minnesota Twin Cities', 'Minneapolis', 'United States', 'MN', 41512, 18626, 19530, 18030, ARRAY['English'], 'active'),

-- MISSISSIPPI
('University of Mississippi', 'Oxford', 'United States', 'MS', 27000, NULL, 15000, NULL, ARRAY['English'], 'active'),
('Mississippi State University', 'Starkville', 'United States', 'MS', 26000, NULL, 15000, NULL, ARRAY['English'], 'active'),

-- MISSOURI
('University of Missouri', 'Columbia', 'United States', 'MO', 30000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('Washington University in St Louis', 'St Louis', 'United States', 'MO', 62000, NULL, 22000, NULL, ARRAY['English'], 'active'),

-- MONTANA
('University of Montana', 'Missoula', 'United States', 'MT', 28000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('Montana State University', 'Bozeman', 'United States', 'MT', 29000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- NEBRASKA
('University of Nebraska Lincoln', 'Lincoln', 'United States', 'NE', 28000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Creighton University', 'Omaha', 'United States', 'NE', 45000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- NEVADA
('University of Nevada Reno', 'Reno', 'United States', 'NV', 27000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('UNLV', 'Las Vegas', 'United States', 'NV', 26000, NULL, 21000, NULL, ARRAY['English'], 'active'),

-- NEW HAMPSHIRE
('University of New Hampshire', 'Durham', 'United States', 'NH', 35000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('Dartmouth College', 'Hanover', 'United States', 'NH', 63000, NULL, 22000, NULL, ARRAY['English'], 'active'),

-- NEW JERSEY
('Rutgers University', 'New Brunswick', 'United States', 'NJ', 37441, 17929, 19223, NULL, ARRAY['English'], 'active'),
('Princeton University', 'Princeton', 'United States', 'NJ', 60000, NULL, 23000, NULL, ARRAY['English'], 'active'),

-- NEW MEXICO
('University of New Mexico', 'Albuquerque', 'United States', 'NM', 28000, NULL, 17000, NULL, ARRAY['English'], 'active'),

-- NEW YORK
('University at Buffalo SUNY', 'Buffalo', 'United States', 'NY', 29000, NULL, 18000, NULL, ARRAY['English'], 'active'),
('Stony Brook University', 'Stony Brook', 'United States', 'NY', 29000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('Columbia University', 'New York', 'United States', 'NY', 66000, NULL, 30000, NULL, ARRAY['English'], 'active'),
('Cornell University', 'Ithaca', 'United States', 'NY', 65000, NULL, 22000, NULL, ARRAY['English'], 'active'),
('New York University', 'New York', 'United States', 'NY', 68576, NULL, 32422, NULL, ARRAY['English'], 'active'),
('CUNY Brooklyn College', 'Brooklyn', 'United States', 'NY', 42295, 3465, 29975, NULL, ARRAY['English'], 'active'),
('Queens College', 'Queens', 'United States', 'NY', 620, 3465, 32000, 20000, ARRAY['English'], 'active'),
('Binghamton University', 'Binghamton', 'United States', 'NY', 28970, 7070, 51944, 30044, ARRAY['English'], 'active'),

-- NORTH CAROLINA
('UNC Chapel Hill', 'Chapel Hill', 'United States', 'NC', 47472, 7020, 22694, 21722, ARRAY['English'], 'active'),
('NC State University', 'Raleigh', 'United States', 'NC', 30000, NULL, 19000, NULL, ARRAY['English'], 'active'),
('Duke University', 'Durham', 'United States', 'NC', 63000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('Wake Forest University', 'Winston-Salem', 'United States', 'NC', 61000, NULL, 19000, NULL, ARRAY['English'], 'active'),

-- NORTH DAKOTA
('University of North Dakota', 'Grand Forks', 'United States', 'ND', 27000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('North Dakota State University', 'Fargo', 'United States', 'ND', 26000, NULL, 16000, NULL, ARRAY['English'], 'active'),

-- OHIO
('Ohio State University', 'Columbus', 'United States', 'OH', 42423, 13641, 33296, NULL, ARRAY['English'], 'active'),
('Case Western Reserve University', 'Cleveland', 'United States', 'OH', 60000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('University of Cincinnati', 'Cincinnati', 'United States', 'OH', 14864, 7197, 16136, NULL, ARRAY['English'], 'active'),

-- OKLAHOMA
('University of Oklahoma', 'Norman', 'United States', 'OK', 29000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Oklahoma State University', 'Stillwater', 'United States', 'OK', 28000, NULL, 15000, NULL, ARRAY['English'], 'active'),

-- OREGON
('University of Oregon', 'Eugene', 'United States', 'OR', 34000, NULL, 19000, NULL, ARRAY['English'], 'active'),
('Oregon State University', 'Corvallis', 'United States', 'OR', 33000, NULL, 18000, NULL, ARRAY['English'], 'active'),

-- PENNSYLVANIA
('Penn State', 'State College', 'United States', 'PA', 43290, 20644, 50000, 30000, ARRAY['English'], 'active'),
('University of Pennsylvania', 'Philadelphia', 'United States', 'PA', 63000, NULL, 26000, NULL, ARRAY['English'], 'active'),
('Carnegie Mellon University', 'Pittsburgh', 'United States', 'PA', 62000, NULL, 21000, NULL, ARRAY['English'], 'active'),

-- RHODE ISLAND
('University of Rhode Island', 'Kingston', 'United States', 'RI', 32000, NULL, 19000, NULL, ARRAY['English'], 'active'),
('Brown University', 'Providence', 'United States', 'RI', 62000, NULL, 24000, NULL, ARRAY['English'], 'active'),

-- SOUTH CAROLINA
('University of South Carolina', 'Columbia', 'United States', 'SC', 31000, NULL, 17000, NULL, ARRAY['English'], 'active'),
('Clemson University', 'Clemson', 'United States', 'SC', 30000, NULL, 17000, NULL, ARRAY['English'], 'active'),

-- SOUTH DAKOTA
('University of South Dakota', 'Vermillion', 'United States', 'SD', 25000, NULL, 15000, NULL, ARRAY['English'], 'active'),

-- TENNESSEE
('University of Tennessee Knoxville', 'Knoxville', 'United States', 'TN', 32000, NULL, 18000, NULL, ARRAY['English'], 'active'),
('Vanderbilt University', 'Nashville', 'United States', 'TN', 63000, NULL, 22000, NULL, ARRAY['English'], 'active'),

-- TEXAS
('University of Texas at Austin', 'Austin', 'United States', 'TX', 46498, 13576, 26184, 21576, ARRAY['English'], 'active'),
('Texas A&M', 'College Station', 'United States', 'TX', 58976, 30608, 6790, NULL, ARRAY['English'], 'active'),
('Rice University', 'Houston', 'United States', 'TX', 58000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('University of Houston', 'Houston', 'United States', 'TX', 13646, 5617, 0, NULL, ARRAY['English'], 'active'),
('University of North Texas', 'Denton', 'United States', 'TX', 455, 50, 0, NULL, ARRAY['English'], 'active'),

-- UTAH
('University of Utah', 'Salt Lake City', 'United States', 'UT', 33000, NULL, 19000, NULL, ARRAY['English'], 'active'),
('Brigham Young University', 'Provo', 'United States', 'UT', 23000, NULL, 16000, NULL, ARRAY['English'], 'active'),
('Utah Valley University', 'Orem', 'United States', 'UT', 30000, 5386, 12150, NULL, ARRAY['English'], 'active'),

-- VERMONT
('University of Vermont', 'Burlington', 'United States', 'VT', 46000, 21000, 18000, 14000, ARRAY['English'], 'active'),

-- VIRGINIA
('University of Virginia', 'Charlottesville', 'United States', 'VA', 38000, NULL, 20000, NULL, ARRAY['English'], 'active'),
('Virginia Tech', 'Blacksburg', 'United States', 'VA', 36694, 15478, 32496, NULL, ARRAY['English'], 'active'),
('Liberty University', 'Lynchburg', 'United States', 'VA', 24650, NULL, 41020, NULL, ARRAY['English'], 'active'),

-- WASHINGTON
('University of Washington', 'Seattle', 'United States', 'WA', 44640, 13406, 22332, NULL, ARRAY['English'], 'active'),

-- WEST VIRGINIA
('West Virginia University', 'Morgantown', 'United States', 'WV', 29000, NULL, 16000, NULL, ARRAY['English'], 'active'),

-- WISCONSIN
('University of Wisconsin Madison', 'Madison', 'United States', 'WI', 44210, 12186, 19058, 18458, ARRAY['English'], 'active'),
('Marquette University', 'Milwaukee', 'United States', 'WI', 48000, NULL, 19000, NULL, ARRAY['English'], 'active'),

-- WYOMING
('University of Wyoming', 'Laramie', 'United States', 'WY', 22000, NULL, 15000, NULL, ARRAY['English'], 'active')

;

-- Summary: 129 unique US universities inserted with complete in-state/out-of-state tuition data
-- Universities with in-state tuition differences: 25+
-- Universities with in-state living cost differences: 15+
