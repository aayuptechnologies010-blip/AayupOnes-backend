const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken } = require('../middlewares/auth');

// Superadmin Broadcast & Targeted Announcement API
router.post('/broadcast', authenticateToken, announcementController.createAnnouncement);

// Get Announcement History / Logs
router.get('/', authenticateToken, announcementController.getAnnouncementsList);

// Register or Update Device FCM Token (Called from Flutter Mobile App)
router.post('/register-fcm', announcementController.registerDeviceToken);

module.exports = router;

