const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Public Onboarding Form Submission (Requires no pre-authenticated admin token)
router.post('/onboard/:token/submit', employeeController.submitOnboarding);

// All employee administration endpoints require authentication
router.use(authenticateToken);

// 1. Directory & Listing with Search, Filter & Counts
router.get('/', employeeController.getAllEmployees);

// 2. View Inside (Single Employee Full Details & Dossier)
router.get('/:id', employeeController.getEmployeeDetails);

// 3. Add Employee (Quick Details & Generate ID)
router.post('/create', requireRole(['admin', 'hr']), employeeController.createEmployee);

// 4. Reset Password Action
router.post('/:id/reset-password', requireRole(['admin', 'hr']), employeeController.resetPassword);

// 5. Deactivate / Archive Employee
router.delete('/:id', requireRole(['admin', 'hr']), employeeController.deactivateEmployee);

// 6. Update Section Verification Review
router.patch('/:id/verify', requireRole(['admin', 'hr']), employeeController.updateVerificationStatus);

module.exports = router;

