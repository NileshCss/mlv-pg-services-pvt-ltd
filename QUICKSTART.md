# Quick Start Guide

## ⚡ 5-Minute Setup

### Option 1: Run Frontend Only (Static)
```bash
# Simply open in browser
frontend/index.html
```

### Option 2: Run Full Stack (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
# Use any HTTP server or Python
python -m http.server 3000
# OR
npx http-server -p 3000
```

Then visit: `http://localhost:3000`

## 🛠️ Prerequisites

- **Node.js** v14+ (for backend)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

## 📋 Setup Checklist

- [ ] Clone/download the project
- [ ] Install Node.js
- [ ] Navigate to `backend/` directory
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with your settings
- [ ] Run `npm install`
- [ ] Run `npm start` or `npm run dev`
- [ ] Frontend is ready to use immediately
- [ ] Test with sample registration

## 🧪 Quick Test

1. **Fill registration form** in frontend
2. **Check backend console** for incoming data
3. **View admin panel** (Type 'mlva' quickly)
4. **See data in database** via MongoDB

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
# Check port 5000 is available
# Check .env file is set correctly
```

### Frontend can't connect to backend
```bash
# Verify API_BASE_URL in config.js
# Check CORS is enabled
# Check backend is running on port 5000
```

### Database not working
```bash
# MongoDB connection string is correct
# Database exists
# Credentials are valid
```

## 📱 Production Deployment

See `DEPLOYMENT.md` for:
- Deploy to Heroku
- Deploy to AWS
- Deploy to DigitalOcean
- Docker setup
- Environment configuration

## 💡 Tips

- Use `npm run dev` for development with auto-reload
- Frontend works offline with local storage
- Admin panel auto-initializes on first access
- CSV export includes all fields

## 🔗 Useful Links

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Node.js: https://nodejs.org
- Express.js: https://expressjs.com
- Mongoose: https://mongoosejs.com
