// ===== MLV PG SERVICES — EXPRESS BACKEND (Supabase Edition) =====
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── VERIFY SUPABASE CLIENT LOADS BEFORE ROUTES ───────────────────────────────
// This line will call process.exit(1) if env vars are missing
require('./supabase');

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/contact',       require('./routes/contact'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/health',        require('./routes/health'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 MLV PG Backend running → http://localhost:${PORT}`);
  console.log(`   Database  : Supabase (${process.env.SUPABASE_URL})`);
  console.log(`   CORS      : ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`   Env       : ${process.env.NODE_ENV || 'development'}\n`);
});
