const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', payslipController.getPayslips);
router.post('/send', payslipController.sendPayslip);
router.post('/send-bulk', payslipController.sendBulkPayslips);

module.exports = router;
