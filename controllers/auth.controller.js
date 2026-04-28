import { supabase, supabaseAdmin } from '../config/db.js';
import { validationResult } from 'express-validator';

/** Map DB `users` row (or merged `req.user` profile fields) to API user shape */
const publicUserFromRow = (row) => {
  if (!row) return null;
  const out = {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    country: row.country,
    dateOfBirth: row.date_of_birth ?? null,
    zipCode: row.zip_code ?? null,
    role: row.role,
    createdAt: row.created_at
  };
  if (row.updated_at !== undefined && row.updated_at !== null) {
    out.updatedAt = row.updated_at;
  }
  return out;
};

function validateDateOfBirthValue(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return 'Invalid date of birth';
  }
  const now = new Date();
  if (d > now) {
    return 'Date of birth cannot be in the future';
  }
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
    age -= 1;
  }
  if (age < 13) {
    return 'You must be at least 13 years old';
  }
  return null;
}

// Register new user
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      country,
      dateOfBirth,
      zipCode
    } = req.body;

    // Check if user already exists and has taken the quiz
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      // Check if this user has already taken the quiz
      const { data: existingQuiz, error: quizError } = await supabase
        .from('quiz_answers')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();

      if (existingQuiz) {
        return res.status(400).json({
          success: false,
          error: "Looks like you've already taken the quiz and received your full report. Please check your email!"
        });
      }
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email for now
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message || 'Failed to create user account'
      });
    }

    // Create user profile in our users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        country: country || null,
        date_of_birth: dateOfBirth,
        zip_code: zipCode && String(zipCode).trim() ? String(zipCode).trim() : null
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile'
      });
    }

    // Sign in the newly created user to get a session token
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: authData.user.email,
      password: password
    });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
    }

    const userData = publicUserFromRow(userProfile);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      token: sessionData?.session?.access_token || null
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }

    const userData = publicUserFromRow(userProfile);

    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: authData.session.access_token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userData = publicUserFromRow(user);

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
};

// Get Supabase auth user data (for onboarding - before profile exists)
export const getAuthUser = async (req, res) => {
  try {
    const user = req.user; // This comes from authenticateAuthOnly middleware

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Return the raw Supabase auth user data including metadata
    res.json({
      success: true,
      data: user // This includes user_metadata with onboarding_token
    });

  } catch (error) {
    console.error('Get auth user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auth user data'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { firstName, lastName, phone, country, zipCode, dateOfBirth } = req.body;

    const existingDob = req.user.date_of_birth;

    const updatePayload = {
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      country: country || null,
      updated_at: new Date().toISOString()
    };

    if (zipCode !== undefined) {
      const trimmed = zipCode != null ? String(zipCode).trim() : '';
      updatePayload.zip_code = trimmed ? trimmed : null;
    }

    if (dateOfBirth !== undefined && dateOfBirth !== null && String(dateOfBirth).trim() !== '') {
      if (existingDob) {
        return res.status(400).json({
          success: false,
          error: 'Date of birth cannot be changed'
        });
      }
      const dobError = validateDateOfBirthValue(dateOfBirth);
      if (dobError) {
        return res.status(400).json({
          success: false,
          error: dobError
        });
      }
      updatePayload.date_of_birth = dateOfBirth;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    const userData = publicUserFromRow(updatedProfile);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during profile update'
    });
  }
};

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Send password reset email using Supabase
    const baseUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, you will receive password reset instructions.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email address.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during password reset request'
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Decode JWT token to get user information
    let userId;
    try {
      // Simple JWT decode (without verification since Supabase will verify)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub;

      // Check if token is for password recovery
      if (!payload.aud || payload.aud !== 'authenticated') {
        throw new Error('Invalid token type');
      }
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      return res.status(400).json({
        success: false,
        error: 'Invalid reset token format'
      });
    }

    // Use Supabase Admin API to update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password
    });

    if (error) {
      console.error('Password reset error:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during password reset'
    });
  }
};

// Verify global site password for pre-launch lock
export const verifySitePassword = async (req, res) => {
  try {
    const { password } = req.body;

    // Fetch password from system_configs
    const { data, error } = await supabase
      .from('system_configs')
      .select('config_value')
      .eq('config_key', 'site_password')
      .single();

    // if (password === '123456') {
    //   return res.json({
    //     success: true,
    //     message: 'App unlocked'
    //   });
    // }

    if (error || !data) {
      console.error('Site password lookup error:', error);
      return res.status(401).json({
        success: false,
        error: 'Site password not configured.'
      });
    }

    if (data.config_value && data.config_value.password === password) {
      return res.json({
        success: true,
        message: 'App unlocked'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Incorrect password'
    });
  } catch (error) {
    console.error('Verify site password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while verifying password'
    });
  }
};

