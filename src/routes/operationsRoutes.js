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
router.post('/helpdesk-tickets', authenticateToken, opsController.createHelpdeskTicket);
router.patch('/helpdesk-tickets/:id', authenticateToken, opsController.updateTicketStatus);
router.get('/settings', authenticateToken, opsController.getCompanySettings);
router.patch('/settings', authenticateToken, opsController.updateCompanySettings);

// Posts / Social Wall
router.get('/posts', authenticateToken, opsController.getPosts);
router.post('/posts', authenticateToken, opsController.createPost);
router.patch('/posts/:id/like', authenticateToken, opsController.toggleLikePost);

// Offboarding & Exit Clearance
router.get('/offboarding', authenticateToken, opsController.getOffboardingCases);
router.patch('/offboarding/:id/clearance', authenticateToken, opsController.updateClearanceStatus);
router.patch('/offboarding/:id/settle', authenticateToken, opsController.settleOffboarding);

// Celebrations (Birthdays & Anniversaries)
router.get('/celebrations', authenticateToken, opsController.getTodayCelebrations);

// Tasks API & Dashboard Summary for App
router.get('/tasks', authenticateToken, opsController.getMyTasks);
router.get('/dashboard-summary', authenticateToken, opsController.getMyDashboardSummary);
router.get('/notifications', authenticateToken, opsController.getMyNotifications);
router.post('/notifications/read-all', authenticateToken, opsController.markNotificationsRead);

module.exports = router;

