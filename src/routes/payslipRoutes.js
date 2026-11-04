const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', payslipController.getPayslips);

module.exports = router;
