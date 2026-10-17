import { HAZARD_CATEGORIES, URGENCY_LEVELS } from '../../client/src/utils/constants.js';

const VALID_CATEGORIES = [
  'Electrical Hazard',
  'Water Leakage',
  'Open Manhole',
  'Road Damage',
  'Sewage Overflow',
  'Other'
];

const VALID_URGENCIES = ['Low', 'Medium', 'Critical'];

const VALID_STATUSES = [
  'Reported',
  'Acknowledged',
  'Assigned',
  'In Progress',
  'Verified',
  'Resolved',
  'Rejected'
];

export function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (role && !['citizen', 'crew', 'admin'].includes(role)) {
    errors.push("Role must be 'citizen', 'crew', or 'admin'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }
  next();
}

export function validateIncident(req, res, next) {
  const { title, category, description, address, urgency, latitude, longitude } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters.');
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description must provide sufficient detail (at least 10 characters).');
  }

  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    errors.push('A specific location address or street name is required.');
  }

  if (urgency && !VALID_URGENCIES.includes(urgency)) {
    errors.push(`Urgency must be one of: ${VALID_URGENCIES.join(', ')}`);
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('Valid latitude between -90 and 90 is required.');
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('Valid longitude between -180 and 180 is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Invalid incident submission data', errors });
  }

  next();
}

export function validateStatusUpdate(req, res, next) {
  const { status, rejectionReason, notes } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  if (status === 'Rejected' && (!rejectionReason || rejectionReason.trim().length < 5)) {
    return res.status(400).json({
      success: false,
      message: 'A rejection reason of at least 5 characters is mandatory when rejecting an incident.'
    });
  }

  next();
}
