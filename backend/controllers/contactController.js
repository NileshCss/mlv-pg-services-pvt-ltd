// ===== CONTACT CONTROLLER =====
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// CREATE CONTACT
exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Optional: Send email notification
    try {
      await sendContactEmail(contact);
    } catch (emailErr) {
      console.warn('Email notification failed:', emailErr);
    }

    res.status(201).json({ success: true, data: contact, message: 'Message received successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL CONTACTS
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ created_at: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE CONTACT STATUS
exports.updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE CONTACT
exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEND EMAIL NOTIFICATION
async function sendContactEmail(contact) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'admin@mlvpg.com',
    subject: `New Contact Form Submission from ${contact.name}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
      <p><strong>Date:</strong> ${new Date(contact.created_at).toLocaleString()}</p>
    `
  };

  return transporter.sendMail(mailOptions);
}
