# Campus Israel Database Schema Documentation

## Overview

This document provides a comprehensive explanation of all database tables, fields, relationships, and Row Level Security (RLS) policies for the Campus Israel platform. The database uses PostgreSQL via Supabase with RLS enabled for data security.

## Table Structure & Relationships

```
users (1) ←→ (1) quiz_answers
users (1) ←→ (*) saved_programs
users (1) ←→ (*) applications
users (1) ←→ (*) documents
users (1) ←→ (*) appointments
users (1) ←→ (*) user_roles

universities (1) ←→ (*) programs
programs (1) ←→ (*) saved_programs
programs (1) ←→ (*) applications

applications (1) ←→ (*) documents
```

## Core Tables

### 1. users
**Purpose**: Extends Supabase's built-in auth.users table with additional user profile information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User's unique identifier from Supabase Auth |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address |
| `first_name` | TEXT | NULL | User's first name |
| `last_name` | TEXT | NULL | User's last name |
| `phone` | TEXT | NULL | User's phone number |
| `country` | TEXT | NULL | User's country of origin |
| `role` | TEXT | NOT NULL, DEFAULT 'student' | User role (student, concierge, admin) |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last profile update timestamp |

**Key Points**:
- Links to Supabase's auth system via foreign key
- Stores additional profile data not in auth.users
- Email uniqueness enforced at database level

### 2. quiz_answers
**Purpose**: Stores completed quiz responses and LLM-generated analysis. Enforces one quiz per user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique quiz record identifier |
| `user_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE, UNIQUE | Links to user (one-to-one) |
| `answers` | JSONB | NOT NULL | Array of answer objects with flexible structure for different question types |
| `total_questions` | INTEGER | DEFAULT 0 | Total number of questions answered (dynamic based on conditional logic) |
| `question_path` | JSONB | DEFAULT '[]'::jsonb | Array of question IDs actually shown to user |
| `section_weights` | JSONB | NULL | User priority distribution from Q5 (degree/campus/city weights) |
| `riasec_scores` | JSONB | NULL | RIASEC vocational interest scores |
| `personality_scores` | JSONB | NULL | Big Five personality trait scores |
| `brilliance_summary` | TEXT | NULL | LLM-generated user strengths summary |
| `program_matches` | JSONB | NULL | LLM-generated program recommendations with reasoning |
| `cost_analysis` | JSONB | NULL | Financial analysis and recommendations |
| `completed_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Quiz completion timestamp |

**JSONB Structure Examples**:
```json
// answers field - New flexible format
[
  {
    "questionId": "q1",
    "questionType": "text_field",
    "answer": { "value": "John Doe" },
    "timestamp": "2026-02-13T22:20:00Z"
  },
  {
    "questionId": "q8", 
    "questionType": "nested_rating",
    "answer": {
      "ratings": {
        "business": 4,
        "calculator": 2,
        "electronics": 0
      }
    },
    "timestamp": "2026-02-13T22:25:00Z"
  }
]

// section_weights field
{
  "degree": 60,
  "campus": 25, 
  "city": 15
}

// riasec_scores field
{
  "realistic": 3.2,
  "investigative": 4.1,
  "artistic": 2.8,
  "social": 3.7,
  "enterprising": 3.9,
  "conventional": 2.4
}

// program_matches field
{
  "matches": [
    {
      "program_id": "uuid",
      "university_name": "Tel Aviv University",
      "program_name": "Computer Science",
      "match_score": 0.92,
      "reasoning": "Strong analytical thinking and technology interest align perfectly..."
    }
  ]
}

// cost_analysis field
{
  "estimated_total_cost": 45000,
  "tuition_range": [15000, 25000],
  "living_costs": 18000,
  "recommendations": ["Apply for scholarships", "Consider part-time work"]
}
```

**Key Points**:
- UNIQUE constraint on user_id enforces one quiz per user
- JSONB allows flexible storage of complex LLM responses
- Immutable after creation (no updates allowed)

### 3. quiz_progress
**Purpose**: Stores in-progress quiz data for authenticated users. Allows resuming incomplete quizzes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique progress record identifier |
| `user_id` | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE, UNIQUE | Links to user (one-to-one) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'in_progress' | Progress status (always 'in_progress') |
| `current_question` | INTEGER | NOT NULL, DEFAULT 1 | Legacy current question number |
| `current_question_id` | VARCHAR(10) | NULL | Current question ID (e.g., q1, q2) for dynamic flows |
| `answers` | JSONB | NOT NULL, DEFAULT '[]'::jsonb | Array of answer objects with flexible structure |
| `total_questions` | INTEGER | DEFAULT 0 | Total questions answered so far |
| `question_path` | JSONB | DEFAULT '[]'::jsonb | Array of question IDs shown to user for navigation history |
| `section_weights` | JSONB | NULL | User priority weights from Q5 (degree/campus/city distribution) |
| `started_at` | TIMESTAMP | DEFAULT NOW() | Quiz start timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**JSONB Structure Examples**:
```json
// answers field - Same format as quiz_answers
[
  {
    "questionId": "q1",
    "questionType": "text_field", 
    "answer": { "value": "John Doe" },
    "timestamp": "2026-02-13T22:20:00Z"
  }
]

// question_path field - Navigation history
["q1", "q2", "q5", "q9", "q10"]

// section_weights field
{
  "degree": 60,
  "campus": 25,
  "city": 15
}
```

**Key Points**:
- UNIQUE constraint on user_id enforces one in-progress quiz per user
- Deleted when quiz is completed (moved to quiz_answers)
- Supports dynamic question flows with conditional logic
- Maintains navigation history for proper back/forward functionality

### 4. universities
**Purpose**: Master data for Israeli universities in the platform.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique university identifier |
| `name` | TEXT | NOT NULL | Official university name |
| `city` | TEXT | NOT NULL | University location |
| `description` | TEXT | NULL | University description and highlights |
| `website_url` | TEXT | NULL | Official university website |
| `application_url` | TEXT | NULL | Direct link to application portal |
| `logo_url` | TEXT | NULL | University logo image URL |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |

**Key Points**:
- Master reference data managed by admins
- Publicly readable for all users
- Links to programs via one-to-many relationship

### 4. programs
**Purpose**: Academic programs offered by universities, with application requirements and costs.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique program identifier |
| `university_id` | UUID | NOT NULL, REFERENCES universities(id) ON DELETE CASCADE | Links to parent university |
| `name` | TEXT | NOT NULL | Program name (e.g., "Computer Science") |
| `degree_level` | TEXT | NOT NULL | bachelor, master, phd |
| `field` | TEXT | NOT NULL | Academic field/category |
| `discipline` | TEXT | NULL | Academic discipline for grouping |
| `domain` | TEXT | NULL | Domain category (Future Builders, etc.) |
| `career_horizon` | VARCHAR(60) | NULL | Career direction/archetype |
| `short_description` | VARCHAR(60) | NULL | Brief program description |
| `duration_years` | INTEGER | NULL | Program length in years |
| `tuition_usd` | INTEGER | NULL | Annual tuition in USD |
| `description` | TEXT | NULL | Program description and highlights |
| `requirements` | JSONB | NULL | Application requirements and prerequisites |
| `application_url` | TEXT | NULL | Direct link to program application |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |

**JSONB Structure Example**:
```json
// requirements field
{
  "documents": ["transcript", "cv", "personal_statement", "passport"],
  "min_gpa": 3.0,
  "language_requirements": {
    "english": "IELTS 6.5 or TOEFL 90",
    "hebrew": "Not required"
  },
  "prerequisites": ["Mathematics", "Physics"],
  "application_deadline": "2024-03-15"
}
```

**Domain Hierarchy**:
The new domain system creates a structured hierarchy for program organization:
```
Domain (5 hardcoded options)
├── Future Builders
├── Human Insight & Impact  
├── Power, Policy & Influence
├── Culture & Creativity
└── Explorative Paths
    └── Discipline (15 client-approved categories)
        └── Degree Title (program.name)
            └── Career Horizon (career direction/archetype)
```

**Key Points**:
- Links to universities via foreign key with CASCADE delete
- JSONB requirements allow flexible requirement structures
- Publicly readable for program discovery
- Domain field enables grouping programs for discovery pages
- Career horizon describes potential career paths
- Short description provides brief program overview for search results

### 5. saved_programs
**Purpose**: Junction table tracking which programs users have saved for later reference.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique save record identifier |
| `user_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | User who saved the program |
| `program_id` | UUID | NOT NULL, REFERENCES programs(id) ON DELETE CASCADE | Saved program |
| `saved_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | When program was saved |

**Key Points**:
- UNIQUE constraint on (user_id, program_id) prevents duplicates
- CASCADE deletes maintain referential integrity
- Simple many-to-many relationship table

### 6. applications
**Purpose**: Tracks user applications to specific programs through various stages.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique application identifier |
| `user_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Applicant user |
| `program_id` | UUID | NOT NULL, REFERENCES programs(id) ON DELETE CASCADE | Target program |
| `status` | TEXT | NOT NULL, DEFAULT 'draft' | Current application status |
| `external_redirect_url` | TEXT | NULL | URL where user was redirected to apply |
| `redirected_at` | TIMESTAMP WITH TIME ZONE | NULL | When user clicked external application link |
| `confirmed_at` | TIMESTAMP WITH TIME ZONE | NULL | When user confirmed application completion |
| `notes` | TEXT | NULL | User or admin notes about application |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Application creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last status update timestamp |

**Status Flow**:
```
draft → info_filled → docs_uploaded → redirected → confirmed_applied
```

**Key Points**:
- UNIQUE constraint on (user_id, program_id) prevents duplicate applications
- Status tracking enables funnel analysis and automation
- Timestamps track user journey through application process

### 7. documents
**Purpose**: Manages uploaded application documents with security and virus scanning.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique document identifier |
| `user_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Document owner |
| `application_id` | UUID | REFERENCES applications(id) ON DELETE CASCADE | Associated application (optional) |
| `document_type` | TEXT | NOT NULL | Document category (transcript, cv, etc.) |
| `original_filename` | TEXT | NOT NULL | User's original filename |
| `s3_key` | TEXT | NOT NULL | S3 storage key/path |
| `file_size` | INTEGER | NULL | File size in bytes |
| `mime_type` | TEXT | NULL | File MIME type |
| `virus_scan_status` | TEXT | DEFAULT 'pending' | pending, clean, infected |
| `virus_scan_result` | JSONB | NULL | Detailed scan results |
| `uploaded_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Upload completion timestamp |

**Document Types**:
- `transcript` - Academic transcripts
- `cv` - Curriculum Vitae/Resume
- `personal_statement` - Personal statement/essay
- `passport` - Passport copy
- `recommendation_letter` - Letters of recommendation
- `portfolio` - Creative portfolios
- `other` - Other supporting documents

**Key Points**:
- Links to both users and applications
- Virus scanning workflow with status tracking
- S3 integration for secure file storage

### 8. appointments
**Purpose**: Manages concierge appointments between users and admin staff with Google Calendar integration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique appointment identifier |
| `user_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student booking appointment |
| `admin_user_id` | UUID | REFERENCES users(id) | Admin/concierge assigned |
| `scheduled_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Appointment date and time |
| `duration_minutes` | INTEGER | DEFAULT 30 | Appointment duration |
| `status` | TEXT | DEFAULT 'scheduled' | scheduled, completed, cancelled |
| `meeting_url` | TEXT | NULL | Video call link (Zoom, Google Meet) |
| `notes` | TEXT | NULL | Appointment notes |
| `google_event_id` | TEXT | NULL | Google Calendar event ID for sync |
| `reschedule_token` | TEXT | NULL | Secure token for email-based rescheduling |
| `token_expires_at` | TIMESTAMP WITH TIME ZONE | NULL | Reschedule token expiration |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Booking timestamp |

**Key Points**:
- Links users to admin staff for concierge services
- Google Calendar integration for real-time availability
- Secure email-based rescheduling with expiring tokens
- Status management for appointment lifecycle

### 9. concierges
**Purpose**: Manages concierge profiles with Google Calendar integration for appointment scheduling.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique concierge identifier |
| `user_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE, UNIQUE | Links to user account with concierge role |
| `name` | TEXT | NOT NULL | Concierge display name |
| `email` | TEXT | NOT NULL | Concierge contact email |
| `calendar_provider` | TEXT | DEFAULT 'google' | Calendar service provider (google, outlook) |
| `google_access_token_encrypted` | TEXT | NULL | Encrypted Google OAuth access token |
| `google_refresh_token_encrypted` | TEXT | NULL | Encrypted Google OAuth refresh token |
| `google_calendar_id` | TEXT | NULL | Google Calendar ID for availability sync |
| `last_sync_at` | TIMESTAMP WITH TIME ZONE | NULL | Last calendar synchronization timestamp |
| `calendar_connected_at` | TIMESTAMP WITH TIME ZONE | NULL | When calendar was first connected |
| `is_available` | BOOLEAN | DEFAULT true | Whether concierge is accepting appointments |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |

**Key Points**:
- One-to-one relationship with users table (concierge role)
- Google Calendar OAuth integration for real-time availability
- Encrypted token storage for security
- Extensible design for future calendar providers (Outlook)
- Availability toggle for concierge management

### 10. audit_logs
**Purpose**: Security and compliance audit trail for sensitive operations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique log entry identifier |
| `user_id` | UUID | REFERENCES users(id) | User who performed action (if applicable) |
| `action` | TEXT | NOT NULL | Action performed (login, update, delete, etc.) |
| `resource_type` | TEXT | NOT NULL | Type of resource affected |
| `resource_id` | UUID | NULL | ID of affected resource |
| `old_values` | JSONB | NULL | Previous values before change |
| `new_values` | JSONB | NULL | New values after change |
| `ip_address` | INET | NULL | User's IP address |
| `user_agent` | TEXT | NULL | User's browser/client info |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | When action occurred |

**Logged Actions**:
- User authentication (login, logout, failed attempts)
- Profile updates
- Application status changes
- Document uploads/downloads
- Admin operations
- Permission changes

**Key Points**:
- Comprehensive audit trail for security
- JSONB fields store flexible change data
- IP and user agent tracking for forensics

**Available Roles** (stored in users.role field):
- `student` - Regular platform users (default)
- `admin` - Full platform administration access (includes all concierge permissions)
- `concierge` - Limited admin access for student support

**Role Hierarchy**:
- Admin users can access all admin features + all concierge features + all student features
- Concierge users can access concierge features + all student features  
- Student users can only access basic platform features

## Row Level Security (RLS) Policies

### User Data Protection

```sql
-- Users can only access their own profile data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);
```

### Quiz Data Security

```sql
-- Users can only see their own quiz results
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz" ON quiz_answers 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz" ON quiz_answers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Note: No UPDATE policy - quiz answers are immutable
```

### Application Privacy

```sql
-- Users can only manage their own applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON applications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own applications" ON applications 
  FOR ALL USING (auth.uid() = user_id);
```

### Document Security

```sql
-- Users can only access their own documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own documents" ON documents 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON documents 
  FOR ALL USING (auth.uid() = user_id);
```

### Public Reference Data

```sql
-- Universities and programs are publicly readable
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are publicly readable" ON universities 
  FOR SELECT USING (true);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs are publicly readable" ON programs 
  FOR SELECT USING (true);
```

### Admin Access Policies

```sql
-- Admin function to check user roles (simplified)
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

-- Admin policies for full data access
CREATE POLICY "Admins can manage all users" ON users 
  FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view all applications" ON applications 
  FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Concierge can view applications" ON applications 
  FOR SELECT USING (is_concierge_or_admin(auth.uid()));
CREATE POLICY "Admins can manage universities" ON universities 
  FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage programs" ON programs 
  FOR ALL USING (is_admin(auth.uid()));
```

## Database Indexes

### Performance Optimization

```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

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

-- Role-based queries
CREATE INDEX idx_users_role ON users(role);
```

## Data Validation Rules

### Application-Level Constraints

```sql
-- Quiz answers must be a non-empty JSON array (dynamic quiz length)
ALTER TABLE quiz_answers ADD CONSTRAINT check_quiz_answers_valid 
  CHECK (jsonb_typeof(answers) = 'array' AND jsonb_array_length(answers) > 0);

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
```

## Backup and Maintenance

### Automated Backups
- **Daily**: Full database backup via Supabase
- **Hourly**: Transaction log backups
- **Weekly**: Long-term archive backups

### Data Retention Policies
- **Audit logs**: 2 years retention
- **Documents**: Retained until user deletion + 30 days
- **Quiz data**: Permanent retention (anonymized after account deletion)
- **Applications**: 5 years retention for compliance

### Maintenance Tasks
- **Weekly**: Analyze table statistics
- **Monthly**: Vacuum and reindex operations
- **Quarterly**: Review and optimize slow queries

## Storage Configuration

### Supabase Storage Buckets

The platform uses Supabase Storage for file management with the following buckets:

#### 1. university-logos
- **Purpose**: Store university logo images
- **Access**: Public bucket
- **File size limit**: 5MB
- **Allowed formats**: Image formats only (JPG, PNG, etc.)
- **Usage**: University profile images displayed throughout the platform

#### 2. user-documents  
- **Purpose**: Store user-uploaded application documents
- **Access**: Private bucket with Row Level Security (RLS)
- **File size limit**: 10MB
- **Allowed formats**: PDF, JPG, PNG, DOCX, DOC
- **Usage**: Passports, transcripts, resumes, recommendation letters, etc.

### Storage Security Policies

The `user-documents` bucket implements strict RLS policies to ensure data privacy:

```sql
-- Policy 1: Users can upload own documents (INSERT)
CREATE POLICY "Users can upload own documents" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK ((auth.uid())::text = (storage.foldername(name))[1]);

-- Policy 2: Users can view own documents (SELECT)  
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT TO authenticated
USING ((auth.uid())::text = (storage.foldername(name))[1]);

-- Policy 3: Users can update own documents (UPDATE)
CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE TO authenticated  
USING ((auth.uid())::text = (storage.foldername(name))[1]);

-- Policy 4: Users can delete own documents (DELETE)
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE TO authenticated
USING ((auth.uid())::text = (storage.foldername(name))[1]);
```

### File Organization Structure

Documents are organized by user ID to ensure isolation:

```
user-documents/
├── {user-id-1}/
│   ├── passport-{uuid}.pdf
│   ├── transcript-{uuid}.pdf
│   └── resume-{uuid}.docx
├── {user-id-2}/
│   ├── passport-{uuid}.pdf
│   └── recommendation-letter-{uuid}.pdf
└── ...
```

### Security Features

- **Virus scanning**: Files are scanned using ClamAV (when available) or fallback validation
- **File type validation**: Only approved document types are accepted
- **Size limits**: Maximum 10MB per document to prevent abuse
- **User isolation**: RLS policies prevent cross-user access
- **Audit trail**: All uploads/downloads are logged in the documents table

This schema provides a robust foundation for the Campus Israel platform with proper security, performance optimization, and data integrity constraints.
