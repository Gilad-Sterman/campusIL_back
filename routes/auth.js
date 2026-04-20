import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  getAuthUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifySitePassword
} from '../controllers/auth.controller.js';
import { authenticateUser, authenticateAuthOnly } from '../middleware/auth.js';

const router = express.Router();

// Validation rules for registration
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Country must be at least 2 characters'),
  body('dateOfBirth')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        throw new Error('Invalid date of birth');
      }
      const now = new Date();
      if (d > now) {
        throw new Error('Date of birth cannot be in the future');
      }
      let age = now.getFullYear() - d.getFullYear();
      const monthDiff = now.getMonth() - d.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
        age -= 1;
      }
      if (age < 13) {
        throw new Error('You must be at least 13 years old');
      }
      return true;
    }),
  body('zipCode')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 32 })
    .withMessage('Zip or postal code is too long')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for profile update
const profileUpdateValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Country must be at least 2 characters'),
  body('zipCode')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 32 })
    .withMessage('Zip or postal code is too long'),
  body('dateOfBirth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        throw new Error('Invalid date of birth');
      }
      const now = new Date();
      if (d > now) {
        throw new Error('Date of birth cannot be in the future');
      }
      let age = now.getFullYear() - d.getFullYear();
      const monthDiff = now.getMonth() - d.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
        age -= 1;
      }
      if (age < 13) {
        throw new Error('You must be at least 13 years old');
      }
      return true;
    })
];

// Validation rules for forgot password
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Validation rules for reset password
const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/site-unlock', verifySitePassword);

// Protected routes (require authentication)
router.get('/me', authenticateUser, getProfile);
router.get('/auth-user', authenticateAuthOnly, getAuthUser); // For onboarding - returns Supabase auth user data
router.put('/profile', authenticateUser, profileUpdateValidation, updateProfile);

export default router;
