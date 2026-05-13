// ===== REGISTRATIONS ROUTES =====
const express = require('express');
const router = express.Router();
const c = require('../controllers/registrationController');

// NOTE: Static paths must come BEFORE /:id to avoid Express treating
// "export" as an :id parameter.

// Export as CSV
router.get('/export/csv', c.exportAsCSV);

// CRUD
router.post('/',    c.createRegistration);
router.get('/',     c.getAllRegistrations);
router.get('/:id',  c.getRegistrationById);
router.patch('/:id', c.updateRegistration);
router.delete('/:id', c.deleteRegistration);

module.exports = router;
