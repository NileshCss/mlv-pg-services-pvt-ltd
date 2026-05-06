// ===== REGISTRATIONS ROUTES =====
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Create registration
router.post('/', registrationController.createRegistration);

// Get all registrations
router.get('/', registrationController.getAllRegistrations);

// Get registration by ID
router.get('/:id', registrationController.getRegistrationById);

// Update registration
router.patch('/:id', registrationController.updateRegistration);

// Delete registration
router.delete('/:id', registrationController.deleteRegistration);

// Export as CSV
router.get('/export/csv', registrationController.exportAsCSV);

module.exports = router;
