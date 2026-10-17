import {
  IncidentModel,
  IncidentHistoryModel,
  NotificationModel,
  UserModel
} from '../config/datastore.js';
import { checkForDuplicates } from '../utils/duplicateDetector.js';
import { logger } from '../utils/logger.js';

// Helper to generate unique public incident ID
function generateIncidentId() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CS-${year}-${randomSuffix}`;
}

// @desc    Create new hazard incident report (with server duplicate check)
// @route   POST /api/incidents
// @access  Public / Optional Auth
export async function createIncident(req, res, next) {
  try {
    const {
      title,
      category,
      description,
      urgency,
      address,
      landmark,
      latitude,
      longitude,
      photos,
      forceSubmit
    } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Mandatory Server-Side Duplicate Check
    if (!forceSubmit) {
      const duplicateCheck = await checkForDuplicates({
        category,
        latitude: lat,
        longitude: lng
      });

      if (duplicateCheck.hasDuplicate) {
        logger.info(`Duplicate hazard report intercepted: ${duplicateCheck.count} nearby matches.`);
        return res.status(409).json({
          success: false,
          duplicateWarning: true,
          message: `A similar unresolved ${category} was reported within ${duplicateCheck.radiusMeters}m in the last ${duplicateCheck.hoursWindow} hours.`,
          duplicates: duplicateCheck.duplicates
        });
      }
    }

    const Incident = IncidentModel();
    const IncidentHistory = IncidentHistoryModel();
    const Notification = NotificationModel();
    const User = UserModel();

    // Generate unique ID
    let incidentId = generateIncidentId();
    let exists = await Incident.findOne({ incidentId });
    while (exists) {
      incidentId = generateIncidentId();
      exists = await Incident.findOne({ incidentId });
    }

    // Determine reporter identity
    const reporterId = req.user ? req.user._id : null;
    const reporterName = req.user ? req.user.name : (req.body.reporterName || 'Concerned Citizen');

    const incident = await Incident.create({
      incidentId,
      title: title.trim(),
      category,
      description: description.trim(),
      urgency: urgency || 'Medium',
      address: address.trim(),
      landmark: landmark ? landmark.trim() : '',
      location: {
        type: 'Point',
        coordinates: [lng, lat] // [longitude, latitude] GeoJSON
      },
      photos: Array.isArray(photos) ? photos : [],
      reporter: reporterId,
      reporterName,
      status: 'Reported'
    });

    // 2. Audit Trail Entry
    await IncidentHistory.create({
      incident: incident._id,
      action: 'REPORTED',
      previousStatus: '',
      newStatus: 'Reported',
      actor: reporterId || incident._id, // If anonymous, associate with incident record
      actorName: reporterName,
      actorRole: req.user ? req.user.role : 'citizen',
      notes: `Hazard submitted at coordinates ${lat.toFixed(5)}, ${lng.toFixed(5)}`
    });

    // 3. Notify Admins about new hazard
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        incident: incident._id,
        title: `New Hazard: ${category}`,
        message: `${title} (${urgency} Urgency) reported at ${address}.`,
        type: 'ALERT'
      });
    }

    // If citizen is logged in, confirm report in their in-app notifications
    if (reporterId) {
      await Notification.create({
        recipient: reporterId,
        incident: incident._id,
        title: 'Report Submitted',
        message: `Your report for "${title}" has been registered with ID ${incidentId}.`,
        type: 'STATUS_CHANGE'
      });
    }

    logger.info(`Incident created: ${incidentId} - ${title} (${urgency})`);

    res.status(201).json({
      success: true,
      message: 'Hazard reported successfully.',
      incident
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Get paginated, searchable, filtered incident feed
// @route   GET /api/incidents
// @access  Public
export async function getIncidents(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      urgency,
      status,
      search,
      sortBy = 'newest',
      myReportsOnly
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;

    // Filter to user's reports if authenticated and requested
    if (myReportsOnly === 'true' && req.user) {
      query.reporter = req.user._id;
    }

    // Text search in title, address, landmark, or incidentId
    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { incidentId: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { landmark: { $regex: s, $options: 'i' } }
      ];
    }

    const Incident = IncidentModel();
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sort order
    let sortObj = { createdAt: -1 };
    if (sortBy === 'oldest') sortObj = { createdAt: 1 };
    if (sortBy === 'urgency') sortObj = { urgency: 1 };

    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('assignedCrew', 'name email crewDetails')
      .lean();

    res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      incidents
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Get single incident details by public ID or ObjectId
// @route   GET /api/incidents/:id
// @access  Public
export async function getIncidentById(req, res, next) {
  try {
    const { id } = req.params;
    const Incident = IncidentModel();
    const IncidentHistory = IncidentHistoryModel();

    // Check by public incidentId (e.g. CS-2026-1234) or by _id
    let incident = null;
    if (id.startsWith('CS-')) {
      incident = await Incident.findOne({ incidentId: id.toUpperCase() });
    } else {
      incident = await Incident.findById(id);
      if (!incident) {
        incident = await Incident.findOne({ incidentId: id.toUpperCase() });
      }
    }

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: `Incident not found with identifier '${id}'.`
      });
    }

    // Fetch complete audit history for this incident
    const history = await IncidentHistory.find({ incident: incident._id })
      .sort({ timestamp: -1 })
      .lean();

    res.status(200).json({
      success: true,
      incident,
      history
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Update incident status (Lifecycle: Reported -> Acknowledged -> Assigned -> In Progress -> Verified -> Resolved / Rejected)
// @route   PATCH /api/incidents/:id/status
// @access  Private (Crew or Admin)
export async function updateIncidentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, notes } = req.body;

    const Incident = IncidentModel();
    const IncidentHistory = IncidentHistoryModel();
    const Notification = NotificationModel();

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Role-based restrictions:
    // Citizens cannot modify statuses
    if (req.user.role === 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Citizens are not authorized to modify incident statuses.'
      });
    }

    // Crews can only update incidents assigned to them
    if (req.user.role === 'crew') {
      const assignedId = incident.assignedCrew?._id || incident.assignedCrew;
      if (String(assignedId) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Field crews may only update incidents assigned to their unit.'
        });
      }
    }

    const previousStatus = incident.status;
    incident.status = status;

    if (status === 'Rejected') {
      incident.rejectionReason = rejectionReason;
    }

    await incident.save();

    // Record audit history
    await IncidentHistory.create({
      incident: incident._id,
      action: status === 'Rejected' ? 'REJECTED' : 'STATUS_CHANGE',
      previousStatus,
      newStatus: status,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      notes: notes || (status === 'Rejected' ? `Rejection reason: ${rejectionReason}` : `Status transitioned to ${status}`)
    });

    // Notify citizen reporter
    if (incident.reporter) {
      await Notification.create({
        recipient: incident.reporter,
        incident: incident._id,
        title: `Status: ${status}`,
        message: status === 'Rejected'
          ? `Your incident ${incident.incidentId} was closed: ${rejectionReason}`
          : `Incident ${incident.incidentId} is now ${status}.`,
        type: status === 'Rejected' ? 'REJECTION' : 'STATUS_CHANGE'
      });
    }

    logger.info(`Incident ${incident.incidentId} status changed from ${previousStatus} to ${status} by ${req.user.name}`);

    res.status(200).json({
      success: true,
      message: `Incident status updated to ${status}.`,
      incident
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Assign incident to a field crew
// @route   PATCH /api/incidents/:id/assign
// @access  Private (Admin only)
export async function assignIncident(req, res, next) {
  try {
    const { id } = req.params;
    const { crewId, notes } = req.body;

    if (!crewId) {
      return res.status(400).json({
        success: false,
        message: 'A valid crew member ID is required for assignment.'
      });
    }

    const Incident = IncidentModel();
    const User = UserModel();
    const IncidentHistory = IncidentHistoryModel();
    const Notification = NotificationModel();

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const crew = await User.findById(crewId);
    if (!crew || crew.role !== 'crew') {
      return res.status(400).json({
        success: false,
        message: 'The selected user is not a registered field crew member.'
      });
    }

    const previousStatus = incident.status;
    incident.assignedCrew = crew._id;
    if (incident.status === 'Reported' || incident.status === 'Acknowledged') {
      incident.status = 'Assigned';
    }
    await incident.save();

    // Audit log
    await IncidentHistory.create({
      incident: incident._id,
      action: 'ASSIGNED',
      previousStatus,
      newStatus: incident.status,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      notes: notes || `Dispatched to ${crew.name} (${crew.crewDetails?.department || 'Crew'})`
    });

    // Notify assigned crew
    await Notification.create({
      recipient: crew._id,
      incident: incident._id,
      title: 'New Dispatch Assigned',
      message: `You have been dispatched to ${incident.title} (${incident.urgency} Urgency) at ${incident.address}.`,
      type: 'ASSIGNMENT'
    });

    // Notify reporter
    if (incident.reporter) {
      await Notification.create({
        recipient: incident.reporter,
        incident: incident._id,
        title: 'Crew Dispatched',
        message: `Field crew (${crew.crewDetails?.department || crew.name}) has been assigned to your report ${incident.incidentId}.`,
        type: 'STATUS_CHANGE'
      });
    }

    res.status(200).json({
      success: true,
      message: `Incident successfully dispatched to ${crew.name}.`,
      incident
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Record on-site crew verification notes & technical log
// @route   POST /api/incidents/:id/verification
// @access  Private (Crew or Admin)
export async function recordVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { notes, confirmedHazardLevel, onSitePhotos } = req.body;

    const Incident = IncidentModel();
    const IncidentHistory = IncidentHistoryModel();
    const Notification = NotificationModel();

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const previousStatus = incident.status;
    incident.status = 'Verified';
    incident.verification = {
      verifiedAt: new Date(),
      verifiedBy: req.user._id,
      notes: notes || '',
      confirmedHazardLevel: confirmedHazardLevel || incident.urgency,
      onSitePhotos: Array.isArray(onSitePhotos) ? onSitePhotos : []
    };

    if (confirmedHazardLevel) {
      incident.urgency = confirmedHazardLevel;
    }

    await incident.save();

    // Audit log
    await IncidentHistory.create({
      incident: incident._id,
      action: 'VERIFIED',
      previousStatus,
      newStatus: 'Verified',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      notes: `On-site verification completed: ${notes}`
    });

    // Notify reporter
    if (incident.reporter) {
      await Notification.create({
        recipient: incident.reporter,
        incident: incident._id,
        title: 'Hazard Verified On-Site',
        message: `Field crew has inspected and verified the hazard condition for ${incident.incidentId}.`,
        type: 'VERIFICATION'
      });
    }

    res.status(200).json({
      success: true,
      message: 'On-site verification recorded successfully.',
      incident
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Record hazard resolution with work notes and after photos
// @route   POST /api/incidents/:id/resolution
// @access  Private (Crew or Admin)
export async function recordResolution(req, res, next) {
  try {
    const { id } = req.params;
    const { notes, resolutionPhotos } = req.body;

    if (!notes || notes.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Resolution work notes of at least 5 characters are required.'
      });
    }

    const Incident = IncidentModel();
    const IncidentHistory = IncidentHistoryModel();
    const Notification = NotificationModel();

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const previousStatus = incident.status;
    incident.status = 'Resolved';
    incident.resolution = {
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      notes: notes.trim(),
      resolutionPhotos: Array.isArray(resolutionPhotos) ? resolutionPhotos : []
    };

    await incident.save();

    // Audit log
    await IncidentHistory.create({
      incident: incident._id,
      action: 'RESOLVED',
      previousStatus,
      newStatus: 'Resolved',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      notes: `Hazard resolved: ${notes}`
    });

    // Notify reporter
    if (incident.reporter) {
      await Notification.create({
        recipient: incident.reporter,
        incident: incident._id,
        title: 'Hazard Resolved',
        message: `Your reported hazard ${incident.incidentId} has been resolved by municipal field operations.`,
        type: 'RESOLUTION'
      });
    }

    logger.info(`Incident ${incident.incidentId} officially RESOLVED by ${req.user.name}`);

    res.status(200).json({
      success: true,
      message: 'Hazard marked as resolved with complete documentation.',
      incident
    });
  } catch (err) {
    next(err);
  }
}
