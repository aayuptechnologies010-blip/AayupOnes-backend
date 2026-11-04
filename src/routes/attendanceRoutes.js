const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', attendanceController.getAttendanceLogs);
router.post('/regularize', requireRole(['admin', 'hr']), attendanceController.regularizeAttendance);

module.exports = router;
