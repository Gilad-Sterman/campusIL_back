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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Quiz answers table
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    brilliance_summary TEXT,
    program_matches JSONB,
    cost_analysis JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    website_url TEXT,
    application_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_level TEXT NOT NULL,
    field TEXT NOT NULL,
    duration_years INTEGER,
    tuition_usd INTEGER,
    description TEXT,
    requirements JSONB,
    application_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Saved programs table
CREATE TABLE saved_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- 6. Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    external_redirect_url TEXT,
    redirected_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- 7. Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    virus_scan_status TEXT DEFAULT 'pending',
    virus_scan_result JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Appointments table
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

-- 9. Audit logs table
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

-- =============================================================================
-- DATA VALIDATION CONSTRAINTS
-- =============================================================================

-- Quiz answers must have exactly 30 answers
ALTER TABLE quiz_answers ADD CONSTRAINT check_quiz_answers_valid 
  CHECK (jsonb_array_length(answers) = 30);

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

-- Program degree level must be valid
ALTER TABLE programs ADD CONSTRAINT check_degree_level 
  CHECK (degree_level IN ('bachelor', 'master', 'phd'));

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_role ON users(role);

-- Quiz lookup
CREATE INDEX idx_quiz_answers_user_id ON quiz_answers(user_id);

-- Application queries
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_program_id ON applications(program_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Document queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Program search
CREATE INDEX idx_programs_university_id ON programs(university_id);
CREATE INDEX idx_programs_degree_level ON programs(degree_level);
CREATE INDEX idx_programs_field ON programs(field);

-- Audit log queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

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

-- =============================================================================
-- INITIAL DATA (OPTIONAL)
-- =============================================================================

-- Insert sample universities (uncomment if needed)
/*
INSERT INTO universities (name, city, description, website_url) VALUES
('Tel Aviv University', 'Tel Aviv', 'Leading research university in Israel', 'https://english.tau.ac.il/'),
('Hebrew University of Jerusalem', 'Jerusalem', 'Premier university with strong international programs', 'https://new.huji.ac.il/en'),
('Technion - Israel Institute of Technology', 'Haifa', 'Top technical university specializing in engineering and technology', 'https://www.technion.ac.il/en/'),
('Ben-Gurion University of the Negev', 'Beer Sheva', 'Research university known for innovation and desert studies', 'https://in.bgu.ac.il/en/Pages/default.aspx');
*/

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- If you see this message, the database setup completed successfully!
SELECT 'Campus Israel database setup completed successfully!' as setup_status;
