import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  assignIncident,
  recordVerification,
  recordResolution
} from '../controllers/incidentController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';
import { reportLimiter } from '../middleware/rateLimiter.js';
import { validateIncident, validateStatusUpdate } from '../middleware/validator.js';

const router = express.Router();

router.post('/', reportLimiter, optionalAuth, validateIncident, createIncident);
router.get('/', optionalAuth, getIncidents);
router.get('/:id', getIncidentById);

router.patch('/:id/status', protect, authorize('crew', 'admin'), validateStatusUpdate, updateIncidentStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignIncident);
router.post('/:id/verification', protect, authorize('crew', 'admin'), recordVerification);
router.post('/:id/resolution', protect, authorize('crew', 'admin'), recordResolution);

export default router;
