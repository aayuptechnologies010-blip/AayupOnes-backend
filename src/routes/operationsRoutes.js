const express = require('express');
const router = express.Router();
const opsController = require('../controllers/operationsController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/documents', authenticateToken, opsController.getDocuments);
router.get('/holidays', authenticateToken, opsController.getHolidays);
router.get('/leaves', authenticateToken, opsController.getLeaves);
router.post('/leaves/apply', authenticateToken, opsController.applyLeave);
router.post('/shift/toggle', authenticateToken, opsController.toggleShift);

// Admin Web Specific Routes
router.get('/documents-list', authenticateToken, opsController.getDocumentsList);
router.get('/helpdesk-tickets', authenticateToken, opsController.getHelpdeskTickets);
router.patch('/helpdesk-tickets/:id', authenticateToken, opsController.updateTicketStatus);
router.get('/settings', authenticateToken, opsController.getCompanySettings);
router.patch('/settings', authenticateToken, opsController.updateCompanySettings);

module.exports = router;

