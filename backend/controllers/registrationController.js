// ===== REGISTRATIONS CONTROLLER =====
const Registration = require('../models/Registration');

// CREATE REGISTRATION
exports.createRegistration = async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res.status(201).json({ success: true, data: registration, message: 'Registration created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL REGISTRATIONS
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ created_at: -1 });
    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET REGISTRATION BY ID
exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE REGISTRATION
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    );
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    res.json({ success: true, data: registration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE REGISTRATION
exports.deleteRegistration = async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXPORT AS CSV
exports.exportAsCSV = async (req, res) => {
  try {
    const registrations = await Registration.find();
    let csv = 'Name,Phone,Email,Gender,College,Course,Room,CheckIn,ParentContact,FoodPref,Notes,Status,CreatedAt\n';
    
    registrations.forEach(r => {
      csv += `"${r.full_name}","${r.phone}","${r.email}","${r.gender}","${r.college_name}","${r.course}","${r.room_preference}","${r.check_in_date || ''}","${r.parent_contact}","${r.food_preference}","${r.additional_notes}","${r.status}","${r.created_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mlv_leads_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
