import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../config/db.js';
import { validationResult } from 'express-validator';

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

    const { email, password, firstName, lastName, phone, country } = req.body;

    // Check if user already exists and has taken the quiz
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

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
        country: country || null
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

    // Return user data without sensitive information
    const userData = {
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      phone: userProfile.phone,
      country: userProfile.country,
      role: userProfile.role,
      createdAt: userProfile.created_at
    };

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
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }

    // Return user data
    // Return user data
    const userData = {
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      phone: userProfile.phone,
      country: userProfile.country,
      role: userProfile.role,
      createdAt: userProfile.created_at
    };

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

    // Return user data
    // Return user data
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      country: user.country,
      role: user.role,
      createdAt: user.created_at
    };

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
    const { firstName, lastName, phone, country } = req.body;

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        country: country || null,
        updated_at: new Date().toISOString()
      })
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

    // Return updated user data
    const userData = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      firstName: updatedProfile.first_name,
      lastName: updatedProfile.last_name,
      phone: updatedProfile.phone,
      country: updatedProfile.country,
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at
    };

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
