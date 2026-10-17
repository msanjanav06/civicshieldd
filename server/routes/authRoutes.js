import express from 'express';
import { register, login, getMe, getCrews } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);
router.get('/crews', protect, authorize('admin', 'crew'), getCrews);

export default router;
