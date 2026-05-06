# MLV PG Services - Frontend & Backend Segregation

This project contains a complete segregation of the MLV PG Services website into **Frontend** and **Backend** components.

## 📁 Project Structure

```
mlv_pg_services_website/
├── frontend/                 # Frontend (HTML, CSS, JavaScript)
│   ├── index.html           # Main HTML file
│   ├── css/
│   │   └── styles.css       # All CSS styles
│   ├── js/
│   │   ├── config.js        # Configuration & constants
│   │   ├── api.js           # API calls to backend
│   │   ├── ui.js            # UI & utility functions
│   │   └── admin.js         # Admin-specific functions
│   └── images/              # Image assets
│
└── backend/                  # Backend (Node.js/Express)
    ├── server.js            # Main server file
    ├── package.json         # Dependencies
    ├── .env.example         # Environment variables template
    ├── models/
    │   ├── Registration.js  # Registration schema
    │   └── Contact.js       # Contact form schema
    ├── controllers/
    │   ├── registrationController.js
    │   └── contactController.js
    └── routes/
        ├── registrations.js # Registration endpoints
        ├── contact.js       # Contact form endpoints
        ├── admin.js         # Admin dashboard endpoints
        └── health.js        # Health check endpoint
```

## 🚀 Getting Started

### Frontend Setup

1. Open `frontend/index.html` in a web browser (or serve with a local server)
2. All frontend logic is in `frontend/js/` directory
3. Styles are in `frontend/css/styles.css`

### Backend Setup

1. **Install Node.js** (v14 or higher)

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Setup Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update the variables with your configuration:
     ```bash
     cp .env.example .env
     ```

5. **Configure MongoDB:**
   - Local: `MONGODB_URI=mongodb://localhost:27017/mlv_pg`
   - Atlas: Use your connection string

6. **Start the server:**
   ```bash
   npm start      # Production
   npm run dev    # Development (with nodemon)
   ```

The backend will run on `http://localhost:5000`

## 📡 API Endpoints

### Registrations
- `POST /api/registrations` - Create registration
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get specific registration
- `PATCH /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration
- `GET /api/registrations/export/csv` - Export as CSV

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages
- `PATCH /api/contact/:id` - Update message status
- `DELETE /api/contact/:id` - Delete message

### Admin
- `GET /api/admin/stats` - Get dashboard statistics

### Health
- `GET /api/health` - Health check

## 🔧 Configuration

### Frontend (`frontend/js/config.js`)
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-key';
```

### Backend (`.env`)
- `MONGODB_URI` - Database connection string
- `GMAIL_USER` - Email for contact notifications
- `GMAIL_PASSWORD` - App password for Gmail
- `ADMIN_EMAIL` - Admin email address
- `PORT` - Server port (default: 5000)

## 📦 Technologies Used

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Responsive Design

### Backend
- Node.js
- Express.js
- MongoDB/Mongoose
- Nodemailer (email notifications)
- CORS enabled

## 🔐 Security Features

- Input validation on both frontend and backend
- Email verification
- Phone number validation
- Data sanitization
- CORS protection
- Environment variables for sensitive data

## 📧 Email Notifications

Enable email notifications by:
1. Setting up Gmail App Password
2. Configure in `.env`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-app-password
   ```

## 💾 Database Schema

### Registration Collection
```javascript
{
  full_name: String,
  phone: String,
  email: String,
  gender: String,
  college_name: String,
  course: String,
  room_preference: String,
  check_in_date: Date,
  parent_contact: String,
  food_preference: String,
  additional_notes: String,
  status: 'new' | 'contacted' | 'confirmed',
  created_at: Date,
  updated_at: Date
}
```

### Contact Collection
```javascript
{
  name: String,
  phone: String,
  email: String,
  message: String,
  status: 'new' | 'read',
  created_at: Date
}
```

## 🎯 Features

✓ Pre-registration form with validation
✓ Contact form submission
✓ Admin dashboard with live data
✓ Lead management (status tracking)
✓ CSV export functionality
✓ Email notifications
✓ Responsive design
✓ Mobile menu
✓ FAQ section
✓ Gallery with filters
✓ Testimonials
✓ WhatsApp integration

## 📝 Notes

- Frontend uses local storage as fallback when backend is unavailable
- All API responses include success flag and error messages
- Requests require `Content-Type: application/json` header
- CORS is enabled for localhost

## 🤝 Support

For issues or questions, contact: info@mlvpg.com

---

**Last Updated:** May 2024
