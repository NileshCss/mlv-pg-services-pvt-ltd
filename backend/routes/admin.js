// ===== ADMIN ROUTES (Supabase) =====
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Run all count queries in parallel
    const [
      { count: totalLeads,     error: e1 },
      { count: newLeads,       error: e2 },
      { count: confirmedLeads, error: e3 },
      { count: totalMessages,  error: e4 },
    ] = await Promise.all([
      supabase.from('pre_registrations').select('*', { count: 'exact', head: true }),
      supabase.from('pre_registrations').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('pre_registrations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('contact').select('*', { count: 'exact', head: true }),
    ]);

    const firstError = e1 || e2 || e3 || e4;
    if (firstError) throw firstError;

    res.json({
      success: true,
      data: {
        total_leads:     totalLeads     || 0,
        new_leads:       newLeads       || 0,
        confirmed_leads: confirmedLeads || 0,
        total_messages:  totalMessages  || 0,
      },
    });
  } catch (err) {
    console.error('admin/stats:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── RECENT ACTIVITY ───────────────────────────────────────────────────────────
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [
      { data: recentRegistrations, error: re },
      { data: recentContacts,      error: ce },
    ] = await Promise.all([
      supabase.from('pre_registrations').select('id, full_name, phone, status, created_at').order('created_at', { ascending: false }).limit(limit),
      supabase.from('contact').select('id, name, phone, status, created_at').order('created_at', { ascending: false }).limit(limit),
    ]);

    if (re) throw re;
    if (ce) throw ce;

    res.json({
      success: true,
      data: {
        registrations: recentRegistrations || [],
        contacts:      recentContacts      || [],
      },
    });
  } catch (err) {
    console.error('admin/recent:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
