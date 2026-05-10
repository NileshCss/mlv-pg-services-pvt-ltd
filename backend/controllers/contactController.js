// ===== CONTACT CONTROLLER (Supabase) =====
const supabase = require('../supabase');
const nodemailer = require('nodemailer');
const TABLE = 'contact';

// ── CREATE ────────────────────────────────────────────────────────────────────
exports.createContact = async (req, res) => {
  try {
    // All TEXT columns are NOT NULL in schema
    const payload = {
      name:    req.body.name    || '',
      phone:   req.body.phone   || '',
      email:   req.body.email   || '',
      subject: req.body.subject || '',
      message: req.body.message || '',
      status:  'new',
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    // Optional: email notification (non-blocking)
    sendContactEmail(data).catch(e => console.warn('Email notification skipped:', e.message));

    res.status(201).json({ success: true, data, message: 'Message received successfully' });
  } catch (err) {
    console.error('createContact:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
exports.getAllContacts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('getAllContacts:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE STATUS ─────────────────────────────────────────────────────────────
exports.updateContactStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Contact not found' });

    res.json({ success: true, data });
  } catch (err) {
    console.error('updateContactStatus:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
exports.deleteContact = async (req, res) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('deleteContact:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── EMAIL HELPER ──────────────────────────────────────────────────────────────
async function sendContactEmail(contact) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'admin@mlvpg.com',
    subject: `New Contact from ${contact.name} — MLV PG`,
    html: `
      <h3 style="color:#c9a84c">New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
      ${contact.subject ? `<p><strong>Subject:</strong> ${contact.subject}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
      <hr/>
      <p style="color:#6b7280;font-size:12px">Submitted: ${new Date(contact.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    `,
  });
}
