// ===== BACKEND SERVER =====
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mlv_pg', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✓ MongoDB connected');
}).catch(err => {
  console.error('✗ MongoDB connection error:', err);
});

// ROUTES
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/health', require('./routes/health'));

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
