const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Universal login (supports email / employeeId)
router.post('/login', authController.login);

// Admin / HR exclusive login
router.post('/admin/login', authController.adminLogin);

// Current logged in user profile check
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
