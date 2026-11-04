const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);

// 1. Inbox Listing with Search, Filter & Counts
router.get('/', approvalController.getAllApprovals);

// 2. Policy rules
router.get('/policies', approvalController.getLeavePolicies);
router.patch('/policies', requireRole(['admin', 'hr']), approvalController.updateLeavePolicies);

// 3. Single Action: Approve / Reject
router.patch('/:id/approve', requireRole(['admin', 'hr']), approvalController.approveApproval);
router.patch('/:id/reject', requireRole(['admin', 'hr']), approvalController.rejectApproval);

// 4. Bulk Action
router.post('/bulk-approve', requireRole(['admin', 'hr']), approvalController.bulkApproveAll);

module.exports = router;

