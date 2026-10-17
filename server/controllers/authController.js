import jwt from 'jsonwebtoken';
import { UserModel } from '../config/datastore.js';
import { logger } from '../utils/logger.js';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'civicshield_dev_jwt_secret_token_secure_key_1029384756',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res, next) {
  try {
    const { name, email, password, role, crewDetails } = req.body;
    const User = UserModel();

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      });
    }

    const assignedRole = role && ['citizen', 'crew', 'admin'].includes(role) ? role : 'citizen';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      crewDetails: crewDetails || {
        department: assignedRole === 'crew' ? 'Rapid Response' : 'General Infrastructure',
        vehicleId: '',
        phone: '',
        isAvailable: true
      }
    });

    const token = generateToken(user);

    logger.info(`New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: typeof user.toJSON === 'function' ? user.toJSON() : user
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const User = UserModel();

    // Include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const token = generateToken(user);

    logger.info(`User logged in: ${user.email} [${user.role}]`);

    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token,
      user: typeof user.toJSON === 'function' ? user.toJSON() : user
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private (protect middleware)
export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: typeof req.user.toJSON === 'function' ? req.user.toJSON() : req.user
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Get all crew members for assignment dropdown
// @route   GET /api/auth/crews
// @access  Private (admin or crew)
export async function getCrews(req, res, next) {
  try {
    const User = UserModel();
    const crews = await User.find({ role: 'crew' });
    
    const sanitized = crews.map((c) => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      role: c.role,
      crewDetails: c.crewDetails
    }));

    res.status(200).json({
      success: true,
      count: sanitized.length,
      crews: sanitized
    });
  } catch (err) {
    next(err);
  }
}
