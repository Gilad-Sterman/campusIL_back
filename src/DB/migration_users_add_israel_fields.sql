-- Migration: Add Israel Experience and Hebrew Proficiency to Users Table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ever_been_to_israel BOOLEAN,
ADD COLUMN IF NOT EXISTS hebrew_proficiency TEXT CHECK (hebrew_proficiency IN ('none', 'basic', 'fluent'));

COMMENT ON COLUMN users.ever_been_to_israel IS 'Whether the user has ever been to Israel (Yes/No)';
COMMENT ON COLUMN users.hebrew_proficiency IS 'User''s Hebrew proficiency level (none, basic, fluent)';
