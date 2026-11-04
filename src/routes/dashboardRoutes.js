const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/auth');

// Dynamic dashboard analytics endpoint with auth protection
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

module.exports = router;

