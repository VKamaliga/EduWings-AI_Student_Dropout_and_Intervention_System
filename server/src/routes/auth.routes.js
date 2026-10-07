const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'eduwings_super_secure_jwt_secret_key_2026_xyz';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid institutional email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (!user.active) {
        return res.status(403).json({ message: 'Account is deactivated. Contact system administrator.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = signToken(user);
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          title: user.title,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error during login processing.' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get('/me', authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
router.get('/users', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve users.' });
  }
});

// @route   POST /api/auth/users
// @desc    Create a new user (Admin only)
router.post(
  '/users',
  authenticate,
  authorizeRoles('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'faculty', 'counsellor']).withMessage('Invalid role'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name, email, password, role, department, title } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        department: department || 'General',
        title: title || (role === 'admin' ? 'Administrator' : role === 'counsellor' ? 'Student Counsellor' : 'Assistant Professor'),
      });

      return res.status(201).json({ user });
    } catch (err) {
      return res.status(500).json({ message: 'Error creating user account.' });
    }
  }
);

// @route   PUT /api/auth/users/:id
// @desc    Update user or toggle status (Admin only)
router.put('/users/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, role, department, title, active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (title) user.title = title;
    if (typeof active === 'boolean') user.active = active;
    if (password && password.length >= 6) {
      user.password = password; // pre-save will re-hash
    }

    await user.save();
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update user.' });
  }
});

module.exports = router;
