// ===== CONTACT ROUTES =====
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Create contact
router.post('/', contactController.createContact);

// Get all contacts
router.get('/', contactController.getAllContacts);

// Update contact status
router.patch('/:id', contactController.updateContactStatus);

// Delete contact
router.delete('/:id', contactController.deleteContact);

module.exports = router;
