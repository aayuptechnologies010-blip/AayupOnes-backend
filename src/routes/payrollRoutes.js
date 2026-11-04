const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', payrollController.getPayrollData);
router.post('/run', requireRole(['admin', 'hr']), payrollController.runPayrollBatch);

module.exports = router;
