const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get notifications relevant to user
router.get('/', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    const notifications = await Notification.find({
      $or: [{ recipientRole: 'all' }, { recipientRole: role }, { recipientUser: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving notifications.' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    return res.json({ notification: notif });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notification.' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const role = req.user.role;
    await Notification.updateMany(
      {
        $or: [{ recipientRole: 'all' }, { recipientRole: role }, { recipientUser: req.user._id }],
        read: false,
      },
      { read: true }
    );
    return res.json({ message: 'All marked as read.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to mark all as read.' });
  }
});

module.exports = router;
