// ===== REGISTRATION MODEL =====
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  gender: { type: String, required: true },
  college_name: { type: String, required: true },
  course: { type: String, default: '' },
  room_preference: { type: String, default: '' },
  check_in_date: { type: Date, default: null },
  parent_contact: { type: String, default: '' },
  food_preference: { type: String, default: '' },
  additional_notes: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'confirmed'], default: 'new' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
