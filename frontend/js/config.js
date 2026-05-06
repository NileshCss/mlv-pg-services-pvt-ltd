// ===== FRONTEND CONFIG =====
const API_BASE_URL = 'http://localhost:5000/api';
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Local storage references
let leads = JSON.parse(localStorage.getItem('mlv_leads') || '[]');
let submittedEmails = JSON.parse(localStorage.getItem('mlv_emails') || '[]');
