import { body } from 'express-validator';

export const validateUserSignup = [
  body('name').notEmpty().withMessage('Name is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateUserLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateAdminLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateGroupCreation = [
  body('name').notEmpty().withMessage('Group name is required'),
];

export const validateGroupJoinLeave = [
  body('groupId').notEmpty().withMessage('Group ID is required')
];
