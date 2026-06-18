import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const messages = errors.array().map(err => err.msg);
    throw new Error(messages.join(', '));
  }
  next();
};

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name must not exceed 50 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits')
    .escape(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .escape(),
  validateRequest
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validateRequest
];

export const reviewValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters')
    .escape(),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters')
    .escape(),
  validateRequest
];
