# MLV PG Services - Monorepo Quick Start

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later
- Git

### First-Time Setup

```powershell
# 1. Install all dependencies
npm install

# 2. Navigate to frontend and install
cd frontend
npm install
cd ..

# 3. Navigate to backend and install  
cd backend
npm install
cd ..

# 4. Create environment files
Copy-Item frontend\.env.example frontend\.env.local
Copy-Item backend\.env.example backend\.env.local

# 5. Edit environment files with your values
# frontend/.env.local:
#   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
#   NEXT_PUBLIC_API_URL=http://localhost:3001/api

# backend/.env.local:
#   JWT_SECRET=<your-secret>
#   SUPABASE_URL=<your-supabase-url>
```

## 🏃 Running in Development

### Option 1: Run Everything Together
```powershell
npm run dev
# This runs both frontend and backend concurrently
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Option 2: Run Separately

```powershell
# Terminal 1: Frontend only
npm run dev:frontend
# http://localhost:3000

# Terminal 2: Backend only
npm run dev:backend
# http://localhost:3001

# Terminal 3: Check backend health
Invoke-WebRequest http://localhost:3001/api/health
```

## 🏗️ Building for Production

```powershell
# Build both
npm run build

# Or individually
npm run build:frontend
npm run build:backend
```

## 📝 Running Tests

```powershell
# Type checking all workspaces
npm run type-check

# Linting all workspaces
npm run lint

# Format code
npm run format
```

## 📂 Project Structure

```
.
├── frontend/              # Next.js client application
│   ├── app/               # Next.js pages and routes
│   ├── components/        # React components
│   ├── lib/api-client.ts  # Backend API client
│   └── store/             # Zustand state management
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── server.ts      # Express app
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── dist/              # Built output
├── shared/                # Shared types & constants
│   ├── types/             # TypeScript interfaces
│   └── constants/         # Constants
└── package.json           # Root workspace config
```

## 🔗 API Communication

### Frontend → Backend

The frontend communicates with the backend via the API client in `frontend/lib/api-client.ts`:

```typescript
import { api } from '@/lib/api-client'

// Login
const response = await api.auth.login(email, password)

// Get bookings
const bookings = await api.bookings.getAll()

// Create booking
await api.bookings.create({ studentId, roomId, checkInDate })
```

### Backend Health Check

```powershell
# Verify backend is running
Invoke-WebRequest http://localhost:3001/api/health
# Should return: { "status": "ok", "timestamp": "...", "uptime": ... }
```

## 🔐 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=...        # Supabase URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Supabase anonymous key (public)
NEXT_PUBLIC_API_URL=...             # Backend API URL (public)
```

### Backend (.env.local)
```
NODE_ENV=development
PORT=3001
JWT_SECRET=...                      # Secret for signing JWT tokens
SUPABASE_URL=...                    # Supabase URL (private)
SUPABASE_KEY=...                    # Supabase service key (private)
CORS_ORIGIN=http://localhost:3000   # Frontend URL for CORS
```

## 🐛 Debugging

### Frontend Debugging
```powershell
# VS Code: Press F5 to start debug session
# Or run with debugging
npm run dev:frontend -- --inspect
```

### Backend Debugging
```powershell
# Add breakpoints in VS Code
# F5 to start debugging (uses nodemon + ts-node)
npm run dev:backend
```

## 📦 Adding Dependencies

### To Frontend
```powershell
cd frontend
npm install <package-name>
npm install --save-dev <dev-package-name>
cd ..
```

### To Backend
```powershell
cd backend
npm install <package-name>
npm install --save-dev <dev-package-name>
cd ..
```

### To Shared
```powershell
cd shared
npm install <package-name>
cd ..
```

## 🚢 Deployment

### Frontend to Netlify
```bash
# netlify.toml is already configured
# Push to GitHub and connect to Netlify dashboard
# Automatic deployment on push to main branch
```

### Backend to Node.js Hosting

**Local test before deploying:**
```powershell
npm run build:backend
cd backend
npm start
# http://localhost:3001/api/health
```

**Deploy commands for hosting services:**

**Heroku:**
```bash
heroku create mlv-pg-backend
heroku config:set JWT_SECRET=...
git push heroku main
```

**Railway:**
```bash
railway link
railway up
```

**Render:**
- Connect GitHub repo
- Build command: `npm run build`
- Start command: `npm start`
- Add environment variables in settings

## 🔧 Troubleshooting

### Problem: Port already in use
```powershell
# Find and kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Find and kill process on port 3001 (backend)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problem: "Cannot find module" errors
```powershell
# Clear node_modules and reinstall
rm -Recurse -Force frontend/node_modules backend/node_modules shared/node_modules
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Problem: TypeScript errors
```powershell
# Type check and see detailed errors
npm run type-check

# Clear Next.js cache
rm -Recurse -Force frontend/.next

# Clear TypeScript cache
npm run build:frontend -- --clean
```

### Problem: Backend won't start
```powershell
# Check if port 3001 is already in use
netstat -ano | findstr :3001

# Verify environment variables
cd backend
cat .env.local

# Try starting with verbose logging
NODE_ENV=development npm run dev:backend
```

## 📚 Useful Commands

```powershell
# Development
npm run dev                 # Run everything
npm run dev:frontend       # Run frontend only
npm run dev:backend        # Run backend only

# Building
npm run build              # Build everything
npm run build:frontend     # Build frontend
npm run build:backend      # Build backend

# Quality
npm run type-check         # TypeScript check
npm run lint              # Lint code
npm run format            # Format code

# Utilities
npm run clean             # Clean all build artifacts
npm run install:all       # Fresh install of all dependencies
```

## 📖 Documentation

- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Migration Guide:** See [MONOREPO_MIGRATION_GUIDE.md](./MONOREPO_MIGRATION_GUIDE.md)
- **Frontend Docs:** See [frontend/README.md](./frontend/README.md) (to be created)
- **Backend Docs:** See [backend/README.md](./backend/README.md) (to be created)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: add my feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Open a Pull Request

## 📞 Getting Help

- **Frontend issues:** Check [frontend/README.md](./frontend/README.md)
- **Backend issues:** Check [backend/README.md](./backend/README.md)
- **Deployment issues:** Check [MONOREPO_MIGRATION_GUIDE.md](./MONOREPO_MIGRATION_GUIDE.md#deployment)
- **Architecture questions:** See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Happy coding!** 🎉
