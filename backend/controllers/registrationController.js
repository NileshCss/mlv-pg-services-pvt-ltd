// ===== REGISTRATIONS CONTROLLER (Supabase) =====
const supabase = require('../supabase');
const TABLE = 'pre_registrations';

// ── CREATE ────────────────────────────────────────────────────────────────────
exports.createRegistration = async (req, res) => {
  try {
    // check_in_date is NOT NULL — default to today if omitted
    const checkIn = req.body.check_in_date
      || new Date().toISOString().split('T')[0];

    // All TEXT columns are NOT NULL in schema — use '' instead of null
    const payload = {
      full_name:        req.body.full_name        || '',
      phone:            req.body.phone            || '',
      email:            req.body.email            || '',
      gender:           req.body.gender           || 'Other',
      college_name:     req.body.college_name     || '',
      course:           req.body.course           || '',
      room_preference:  req.body.room_preference  || '',
      check_in_date:    checkIn,
      parent_contact:   req.body.parent_contact   || '',
      food_preference:  req.body.food_preference  || '',
      additional_notes: req.body.additional_notes || '',
      status:           req.body.status           || 'new',
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data, message: 'Registration created successfully' });
  } catch (err) {
    console.error('createRegistration:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
exports.getAllRegistrations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('getAllRegistrations:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── GET BY ID ─────────────────────────────────────────────────────────────────
exports.getRegistrationById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Registration not found' });

    res.json({ success: true, data });
  } catch (err) {
    console.error('getRegistrationById:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
exports.updateRegistration = async (req, res) => {
  try {
    // Build only allowed fields to avoid overwriting with undefined
    const allowed = [
      'full_name', 'phone', 'email', 'gender', 'college_name',
      'course', 'room_preference', 'check_in_date', 'parent_contact',
      'food_preference', 'additional_notes', 'status',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Registration not found' });

    res.json({ success: true, data });
  } catch (err) {
    console.error('updateRegistration:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
exports.deleteRegistration = async (req, res) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (err) {
    console.error('deleteRegistration:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── EXPORT CSV ────────────────────────────────────────────────────────────────
exports.exportAsCSV = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const header = 'Name,Phone,Email,Gender,College,Course,Room,CheckIn,ParentContact,FoodPref,Notes,Status,CreatedAt\n';
    const rows = (data || []).map(r =>
      `"${r.full_name}","${r.phone}","${r.email || ''}","${r.gender}","${r.college_name}","${r.course || ''}","${r.room_preference || ''}","${r.check_in_date || ''}","${r.parent_contact || ''}","${r.food_preference || ''}","${r.additional_notes || ''}","${r.status}","${r.created_at}"`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mlv_leads_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(header + rows.join('\n'));
  } catch (err) {
    console.error('exportAsCSV:', err.message);
    res.status(500).json({ error: err.message });
  }
};
