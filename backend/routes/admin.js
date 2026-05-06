// ===== ADMIN ROUTES =====
const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Contact = require('../models/Contact');

// GET ADMIN DASHBOARD STATS
router.get('/stats', async (req, res) => {
  try {
    const totalLeads = await Registration.countDocuments();
    const newLeads = await Registration.countDocuments({ status: 'new' });
    const confirmedLeads = await Registration.countDocuments({ status: 'confirmed' });
    const totalMessages = await Contact.countDocuments();

    res.json({
      success: true,
      data: {
        total_leads: totalLeads,
        new_leads: newLeads,
        confirmed_leads: confirmedLeads,
        total_messages: totalMessages
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
