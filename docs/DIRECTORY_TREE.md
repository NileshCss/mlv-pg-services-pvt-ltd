mlv_pg_services_website/
│
├── 📄 README.md                          # Main project documentation
├── 📄 QUICKSTART.md                      # 5-minute setup guide
├── 📄 DEPLOYMENT.md                      # Production deployment guide
├── 📄 PROJECT_SUMMARY.md                 # Complete project summary
├── 📄 .gitignore                         # Git ignore configuration
│
├── 📁 frontend/                          # FRONTEND APPLICATION
│   ├── 📄 index.html                    # Main HTML file with all sections
│   │                                    # - Navigation
│   │                                    # - Hero section
│   │                                    # - About section
│   │                                    # - Facilities section
│   │                                    # - Rooms section
│   │                                    # - Testimonials section
│   │                                    # - Gallery section
│   │                                    # - Location section
│   │                                    # - Contact section
│   │                                    # - FAQ section
│   │                                    # - Footer
│   │                                    # - Admin panel
│   │                                    # - Registration popup
│   │
│   ├── 📁 css/
│   │   └── 📄 styles.css               # All CSS styling (2000+ lines)
│   │                                    # - Color variables
│   │                                    # - Responsive design
│   │                                    # - Animations & transitions
│   │                                    # - Component styling
│   │                                    # - Mobile breakpoints
│   │
│   ├── 📁 js/
│   │   ├── 📄 config.js                # Configuration & constants
│   │   │                                # - API base URL
│   │   │                                # - Supabase config
│   │   │                                # - Local storage init
│   │   │
│   │   ├── 📄 api.js                   # Backend API calls
│   │   │                                # - submitRegistrationToBackend()
│   │   │                                # - submitContactFormToBackend()
│   │   │                                # - fetchLeadsFromBackend()
│   │   │                                # - updateLeadStatus()
│   │   │                                # - exportLeadsAsCSV()
│   │   │
│   │   ├── 📄 ui.js                    # UI & utility functions
│   │   │                                # - openPopup() / closePopup()
│   │   │                                # - submitRegistration()
│   │   │                                # - submitContact()
│   │   │                                # - showPage() / scrollTo()
│   │   │                                # - toggleFaq() / filterGallery()
│   │   │                                # - showToast() / toggleMobileMenu()
│   │   │
│   │   └── 📄 admin.js                 # Admin panel functions
│   │                                    # - updateAdminMetrics()
│   │                                    # - renderAdminTable()
│   │                                    # - updateStatus() / filterTable()
│   │                                    # - exportCSV()
│   │
│   └── 📁 images/                      # Image assets (placeholder)
│
└── 📁 backend/                          # BACKEND API SERVER
    ├── 📄 server.js                    # Express.js main server
    │                                    # - CORS setup
    │                                    # - MongoDB connection
    │                                    # - Route initialization
    │                                    # - Error handling
    │
    ├── 📄 package.json                 # Node.js dependencies
    │                                    # - express 4.18.2
    │                                    # - cors 2.8.5
    │                                    # - dotenv 16.0.3
    │                                    # - mongoose 7.0.0
    │                                    # - nodemailer 6.9.1
    │                                    # - uuid 9.0.0
    │                                    # - jsonwebtoken 9.0.0
    │                                    # - bcryptjs 2.4.3
    │
    ├── 📄 .env.example                 # Environment variables template
    │                                    # - MONGODB_URI
    │                                    # - GMAIL_USER / PASSWORD
    │                                    # - ADMIN_EMAIL
    │                                    # - JWT_SECRET
    │                                    # - CORS_ORIGIN
    │
    ├── 📁 models/                      # Mongoose schemas
    │   ├── 📄 Registration.js          # Registration schema
    │   │                                # - full_name (string, required)
    │   │                                # - phone (string, required)
    │   │                                # - email (string)
    │   │                                # - gender (string, required)
    │   │                                # - college_name (string, required)
    │   │                                # - course (string)
    │   │                                # - room_preference (string)
    │   │                                # - check_in_date (date)
    │   │                                # - parent_contact (string)
    │   │                                # - food_preference (string)
    │   │                                # - additional_notes (string)
    │   │                                # - status (new/contacted/confirmed)
    │   │                                # - timestamps
    │   │
    │   └── 📄 Contact.js               # Contact schema
    │                                    # - name (string, required)
    │                                    # - phone (string, required)
    │                                    # - email (string)
    │                                    # - message (string, required)
    │                                    # - status (new/read)
    │                                    # - timestamp
    │
    ├── 📁 controllers/                 # Business logic
    │   ├── 📄 registrationController.js
    │   │                                # POST   /registrations - Create
    │   │                                # GET    /registrations - Get all
    │   │                                # GET    /registrations/:id - Get one
    │   │                                # PATCH  /registrations/:id - Update
    │   │                                # DELETE /registrations/:id - Delete
    │   │                                # GET    /registrations/export/csv
    │   │
    │   └── 📄 contactController.js
    │                                    # POST   /contact - Create
    │                                    # GET    /contact - Get all
    │                                    # PATCH  /contact/:id - Update status
    │                                    # DELETE /contact/:id - Delete
    │                                    # + Email notification (Nodemailer)
    │
    └── 📁 routes/                      # API endpoints
        ├── 📄 registrations.js
        │   ├── POST   /api/registrations
        │   ├── GET    /api/registrations
        │   ├── GET    /api/registrations/:id
        │   ├── PATCH  /api/registrations/:id
        │   ├── DELETE /api/registrations/:id
        │   └── GET    /api/registrations/export/csv
        │
        ├── 📄 contact.js
        │   ├── POST   /api/contact
        │   ├── GET    /api/contact
        │   ├── PATCH  /api/contact/:id
        │   └── DELETE /api/contact/:id
        │
        ├── 📄 admin.js
        │   └── GET    /api/admin/stats
        │
        └── 📄 health.js
            └── GET    /api/health


═══════════════════════════════════════════════════════════════════════════════

📊 FILE COUNT SUMMARY:

Frontend:
  ├── HTML files: 1
  ├── CSS files: 1
  ├── JavaScript files: 4
  └── Total: 6 files

Backend:
  ├── Server files: 1
  ├── Models: 2
  ├── Controllers: 2
  ├── Routes: 4
  ├── Config: 2 (package.json, .env.example)
  └── Total: 11 files

Documentation:
  ├── README.md
  ├── QUICKSTART.md
  ├── DEPLOYMENT.md
  ├── PROJECT_SUMMARY.md
  ├── DIRECTORY_TREE.md (this file)
  └── Total: 5 files

═══════════════════════════════════════════════════════════════════════════════

🎯 KEY PATHS:

Frontend entry:     frontend/index.html
Backend entry:      backend/server.js
Main styles:        frontend/css/styles.css
API configuration:  frontend/js/config.js
MongoDB models:     backend/models/*.js
API routes:         backend/routes/*.js
API controllers:    backend/controllers/*.js

═══════════════════════════════════════════════════════════════════════════════

💻 TO START DEVELOPMENT:

1. Backend:
   cd backend
   npm install
   npm run dev          # Starts on http://localhost:5000

2. Frontend:
   cd frontend
   python -m http.server 3000   # Starts on http://localhost:3000
   OR
   npx http-server -p 3000

═══════════════════════════════════════════════════════════════════════════════

✨ Total Lines of Code:
  - HTML: ~600 lines
  - CSS: ~2,000 lines
  - JavaScript (Frontend): ~400 lines
  - JavaScript (Backend): ~600 lines
  - Total: ~3,600 lines

═══════════════════════════════════════════════════════════════════════════════

Generated: May 2024
Last Updated: May 2024
Version: 1.0.0
Status: ✅ Production Ready
