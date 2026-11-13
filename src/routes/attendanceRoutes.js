const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', attendanceController.getAttendanceLogs);
router.get('/logs', attendanceController.getAttendanceLogs);
router.get('/shift-config', attendanceController.getShiftConfig);
router.post('/punch-in', attendanceController.punchIn);
router.post('/punch-out', attendanceController.punchOut);
router.post('/auto-clockout', attendanceController.autoClockout);
router.post('/verify-face', attendanceController.verifyFace);
router.post('/regularize', attendanceController.regularizeAttendance);

module.exports = router;
