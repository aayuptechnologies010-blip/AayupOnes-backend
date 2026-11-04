const express = require('express');
const router = express.Router();
const reimbursementController = require('../controllers/reimbursementController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', reimbursementController.getReimbursements);
router.patch('/:id/approve', requireRole(['admin', 'hr', 'finance']), reimbursementController.approveClaim);
router.patch('/:id/reject', requireRole(['admin', 'hr', 'finance']), reimbursementController.rejectClaim);

module.exports = router;
