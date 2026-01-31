-- Campus Israel Database Setup Script
-- Run this script in Supabase SQL Editor to create all tables and policies

-- =============================================================================
-- TABLES CREATION
-- =============================================================================

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    country TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Quiz progress table (for in-progress quizzes)
CREATE TABLE quiz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress')),
  current_question INTEGER NOT NULL DEFAULT 1,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one quiz progress per user
  UNIQUE(user_id)
);

-- 3. Quiz answers table (for completed quizzes only)
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  brilliance_summary TEXT,
  program_matches JSONB,
  cost_analysis JSONB,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one completed quiz per user
  UNIQUE(user_id)
);

-- 4. Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT,
    description TEXT,
    website_url TEXT,
    application_url TEXT,
    logo_url TEXT,
    image_url TEXT,
    tuition_avg_usd INTEGER,
    living_cost_usd INTEGER,
    languages TEXT[],
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_level TEXT NOT NULL,
    field TEXT NOT NULL,
    discipline TEXT,
    duration_years INTEGER,
    duration_text TEXT,
    tuition_usd INTEGER,
    tuition_override_usd INTEGER,
    living_cost_override_usd INTEGER,
    description TEXT,
    requirements JSONB,
    doc_requirements TEXT[],
    languages TEXT[],
    application_url TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Saved programs table
CREATE TABLE saved_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- 7. Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    external_redirect_url TEXT,
    redirected_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    marked_as_applied_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- 8. Documents table (Global document library - users upload once, reuse across applications)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    virus_scan_status TEXT DEFAULT 'pending',
    virus_scan_result JSONB,
    status TEXT DEFAULT 'uploaded',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled',
    meeting_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Community configs table (Discord invite links by discipline/region)
CREATE TABLE community_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline TEXT NOT NULL,
    region TEXT NOT NULL,
    invite_link TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(discipline, region)
);

-- 12. Admin invites table (for staff invitation management)
CREATE TABLE admin_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Travel costs table (for cost calculator)
CREATE TABLE travel_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL UNIQUE,
    avg_flight_cost_usd INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Concierges table (for appointment management)
CREATE TABLE concierges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    calendar_integration_type TEXT,
    calendar_integration_data JSONB,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 15. System configs table (for dynamic settings)
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- DATA VALIDATION CONSTRAINTS
-- =============================================================================

-- Add constraint to ensure valid number of answers (5 questions for testing, 30 for production)
ALTER TABLE quiz_answers ADD CONSTRAINT check_quiz_answers_valid 
  CHECK (jsonb_array_length(answers) = 5);

-- Application status must be valid
ALTER TABLE applications ADD CONSTRAINT check_application_status 
  CHECK (status IN ('draft', 'info_filled', 'docs_uploaded', 'redirected', 'confirmed_applied'));

-- Document virus scan status must be valid
ALTER TABLE documents ADD CONSTRAINT check_virus_scan_status 
  CHECK (virus_scan_status IN ('pending', 'clean', 'infected'));

-- Appointment status must be valid
ALTER TABLE appointments ADD CONSTRAINT check_appointment_status 
  CHECK (status IN ('scheduled', 'completed', 'cancelled'));

-- User roles must be valid
ALTER TABLE users ADD CONSTRAINT check_user_role 
  CHECK (role IN ('student', 'admin', 'concierge'));

-- User status must be valid
ALTER TABLE users ADD CONSTRAINT check_user_status 
  CHECK (status IN ('active', 'blocked'));

-- Program degree level must be valid
ALTER TABLE programs ADD CONSTRAINT check_degree_level 
  CHECK (degree_level IN ('bachelor', 'master', 'phd'));

-- Document status must be valid
ALTER TABLE documents ADD CONSTRAINT check_document_status 
  CHECK (status IN ('uploaded', 'approved', 'rejected', 'pending_review'));

-- University status must be valid
ALTER TABLE universities ADD CONSTRAINT check_university_status 
  CHECK (status IN ('active', 'inactive'));

-- Program status must be valid
ALTER TABLE programs ADD CONSTRAINT check_program_status 
  CHECK (status IN ('active', 'inactive'));

-- Admin invite roles must be valid
ALTER TABLE admin_invites ADD CONSTRAINT check_invite_role 
  CHECK (role IN ('admin_view', 'admin_edit', 'concierge'));

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Quiz lookup
CREATE INDEX idx_quiz_answers_user_id ON quiz_answers(user_id);

-- Application queries
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_program_id ON applications(program_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Document queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_user_type ON documents(user_id, document_type);

-- Program search
CREATE INDEX idx_programs_university_id ON programs(university_id);
CREATE INDEX idx_programs_degree_level ON programs(degree_level);
CREATE INDEX idx_programs_field ON programs(field);
CREATE INDEX idx_programs_discipline ON programs(discipline);
CREATE INDEX idx_programs_status ON programs(status);

-- Audit log queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Admin invites queries
CREATE INDEX idx_admin_invites_token ON admin_invites(token);
CREATE INDEX idx_admin_invites_email ON admin_invites(email);

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Admin function to check user roles
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Concierge function to check user roles
CREATE OR REPLACE FUNCTION is_concierge_or_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid AND role IN ('concierge', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users 
  FOR ALL USING (is_admin(auth.uid()));

-- Quiz progress RLS
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz progress" ON quiz_progress 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz progress" ON quiz_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz progress" ON quiz_progress 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quiz progress" ON quiz_progress 
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all quiz progress" ON quiz_progress 
  FOR SELECT USING (is_admin(auth.uid()));

-- Quiz answers RLS
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz" ON quiz_answers 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz" ON quiz_answers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: No UPDATE policy - quiz answers are immutable

-- Applications RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON applications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own applications" ON applications 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON applications 
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Concierge can view applications" ON applications 
  FOR SELECT USING (is_concierge_or_admin(auth.uid()));

-- Documents RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own documents" ON documents 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON documents 
  FOR ALL USING (auth.uid() = user_id);

-- Saved programs RLS
ALTER TABLE saved_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved programs" ON saved_programs 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved programs" ON saved_programs 
  FOR ALL USING (auth.uid() = user_id);

-- Appointments RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointments" ON appointments 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own appointments" ON appointments 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Concierge can view all appointments" ON appointments 
  FOR SELECT USING (is_concierge_or_admin(auth.uid()));
CREATE POLICY "Concierge can manage appointments" ON appointments 
  FOR ALL USING (is_concierge_or_admin(auth.uid()));

-- Universities and programs - publicly readable
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are publicly readable" ON universities 
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage universities" ON universities 
  FOR ALL USING (is_admin(auth.uid()));

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs are publicly readable" ON programs 
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage programs" ON programs 
  FOR ALL USING (is_admin(auth.uid()));

-- Audit logs - admin only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON audit_logs 
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "System can insert audit logs" ON audit_logs 
  FOR INSERT WITH CHECK (true);

-- Community configs RLS
ALTER TABLE community_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community configs are publicly readable" ON community_configs 
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage community configs" ON community_configs 
  FOR ALL USING (is_admin(auth.uid()));

-- Admin invites RLS
ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all invites" ON admin_invites 
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can create invites" ON admin_invites 
  FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can manage invites" ON admin_invites 
  FOR ALL USING (is_admin(auth.uid()));

-- Travel costs RLS (publicly readable)
ALTER TABLE travel_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Travel costs are publicly readable" ON travel_costs 
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage travel costs" ON travel_costs 
  FOR ALL USING (is_admin(auth.uid()));

-- Concierges RLS
ALTER TABLE concierges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Concierges can view own profile" ON concierges 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Concierges can update own profile" ON concierges 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all concierges" ON concierges 
  FOR ALL USING (is_admin(auth.uid()));

-- System configs RLS (publicly readable for certain configs)
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System configs are publicly readable" ON system_configs 
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage system configs" ON system_configs 
  FOR ALL USING (is_admin(auth.uid()));

-- =============================================================================
-- INITIAL DATA (OPTIONAL)
-- =============================================================================

-- Insert system configurations
INSERT INTO system_configs (config_key, config_value, description) VALUES
('us_average_costs', '{"tuition": 40000, "living": 20000, "travel": 500}', 'US average university costs for comparison'),
('discord_general_invite', '{"url": "https://discord.gg/campusisrael", "expires_at": null}', 'General Discord community invite link');

-- Insert sample travel costs for major countries
INSERT INTO travel_costs (country, avg_flight_cost_usd) VALUES
('United States', 800),
('Canada', 900),
('United Kingdom', 600),
('Germany', 500),
('France', 550),
('Australia', 1200),
('Brazil', 1000),
('India', 700),
('China', 800),
('Japan', 900),
('South Korea', 850),
('Mexico', 600),
('Argentina', 1100),
('South Africa', 900),
('Russia', 700);

-- Insert sample universities (uncomment if needed)
/*
INSERT INTO universities (name, city, region, description, website_url, status) VALUES
('Tel Aviv University', 'Tel Aviv', 'Center', 'Leading research university in Israel', 'https://english.tau.ac.il/', 'active'),
('Hebrew University of Jerusalem', 'Jerusalem', 'Center', 'Premier university with strong international programs', 'https://new.huji.ac.il/en', 'active'),
('Technion - Israel Institute of Technology', 'Haifa', 'North', 'Top technical university specializing in engineering and technology', 'https://www.technion.ac.il/en/', 'active'),
('Ben-Gurion University of the Negev', 'Beer Sheva', 'South', 'Research university known for innovation and desert studies', 'https://in.bgu.ac.il/en/Pages/default.aspx', 'active');
*/

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- If you see this message, the database setup completed successfully!
SELECT 'Campus Israel database setup completed successfully!' as setup_status;
