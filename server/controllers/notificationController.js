import { NotificationModel } from '../config/datastore.js';

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
export async function getMyNotifications(req, res, next) {
  try {
    const Notification = NotificationModel();
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('incident', 'incidentId title status')
      .lean();

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (err) {
    next(err);
  }
}

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export async function markNotificationAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const Notification = NotificationModel();

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (String(notif.recipient) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    notif.isRead = true;
    await notif.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification: notif
    });
  } catch (err) {
    next(err);
  }
}
