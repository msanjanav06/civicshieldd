import express from 'express';
import { getDashboardStats, getDashboardActivity } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'crew'), getDashboardStats);
router.get('/activity', protect, authorize('admin', 'crew'), getDashboardActivity);

export default router;
