# Monorepo Migration Guide

This document outlines the complete migration from a single-package setup to a separated frontend/backend monorepo architecture.

## Overview

The project structure has been reorganized into three main workspaces:

```
mlv-pg-services-website/
├── frontend/              # Next.js frontend application
├── backend/               # Express backend API (backend_new → backend after migration)
├── shared/                # Shared types and constants
├── package.json           # Root workspace configuration
└── [legacy files]         # Files to be cleaned up after migration
```

## Migration Steps

### Step 1: Backup Current Project

```powershell
# Create a backup
Copy-Item -Path "." -Destination "../mlv_pg_services_website_backup_$(Get-Date -Format 'yyyyMMdd')" -Recurse
```

### Step 2: Create Directory Structure

The following directories have been created:
- ✅ `frontend/` - Frontend Next.js application
- ✅ `backend_new/` - New backend structure (will be renamed to `backend/`)
- ✅ `shared/` - Shared types and utilities

### Step 3: Move Frontend Files

Move existing frontend-related files to the `frontend/` directory:

```powershell
# Copy frontend source files
Copy-Item -Path "app" -Destination "frontend/app" -Recurse -Force
Copy-Item -Path "components" -Destination "frontend/components" -Recurse -Force
Copy-Item -Path "hooks" -Destination "frontend/hooks" -Recurse -Force
Copy-Item -Path "store" -Destination "frontend/store" -Recurse -Force
Copy-Item -Path "styles" -Destination "frontend/styles" -Recurse -Force
Copy-Item -Path "types" -Destination "frontend/types" -Recurse -Force
Copy-Item -Path "public" -Destination "frontend/public" -Recurse -Force
Copy-Item -Path "middleware.ts" -Destination "frontend/middleware.ts" -Force

# Copy frontend config files
Copy-Item -Path "next.config.js" -Destination "frontend/next.config.js" -Force
Copy-Item -Path "next-env.d.ts" -Destination "frontend/next-env.d.ts" -Force
Copy-Item -Path ".npmrc" -Destination "frontend/.npmrc" -Force
```

### Step 4: Move Backend Files

Move existing backend files to the new backend structure:

```powershell
# Copy existing backend
Copy-Item -Path "backend/*" -Destination "backend_new/src/" -Recurse -Force -Exclude "node_modules"

# Rename backend_new to backend
Remove-Item -Path "backend_old" -Recurse -Force -ErrorAction SilentlyContinue
Rename-Item -Path "backend" -NewName "backend_old" -Force -ErrorAction SilentlyContinue
Rename-Item -Path "backend_new" -NewName "backend" -Force
```

### Step 5: Install Dependencies

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install shared dependencies (if needed)
cd shared
npm install
cd ..
```

### Step 6: Update Environment Files

Create environment files for each workspace:

```powershell
# Frontend environment
New-Item "frontend/.env.local" -Type File -Force
Add-Content "frontend/.env.local" @'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
'@

# Backend environment
New-Item "backend/.env.local" -Type File -Force
Add-Content "backend/.env.local" @'
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_here_change_in_production
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_key_here
CORS_ORIGIN=http://localhost:3000
'@
```

### Step 7: Verify Builds

```powershell
# Test frontend build
cd frontend
npm run build
cd ..

# Test backend build
cd backend
npm run build
cd ..

# Test type checking
npm run type-check
```

### Step 8: Cleanup

Remove legacy files and directories:

```powershell
# Remove legacy directories (after confirming migration successful)
Remove-Item -Path "app" -Recurse -Force
Remove-Item -Path "components" -Recurse -Force
Remove-Item -Path "hooks" -Recurse -Force
Remove-Item -Path "store" -Recurse -Force
Remove-Item -Path "styles" -Recurse -Force
Remove-Item -Path "types" -Recurse -Force
Remove-Item -Path "public" -Recurse -Force
Remove-Item -Path "backend_old" -Recurse -Force

# Remove legacy files
Remove-Item -Path "next.config.js" -Force
Remove-Item -Path "next-env.d.ts" -Force
Remove-Item -Path "middleware.ts" -Force
Remove-Item -Path "tailwind.config.ts" -Force
Remove-Item -Path "postcss.config.js" -Force
Remove-Item -Path "tsconfig.json" -Force
```

### Step 9: Update Package Management Scripts

The root `package.json` now provides consolidated commands:

```bash
npm run dev              # Run both frontend and backend in development mode
npm run dev:frontend    # Run only frontend
npm run dev:backend     # Run only backend
npm run build            # Build both frontend and backend
npm run build:frontend  # Build only frontend
npm run build:backend   # Build only backend
npm run start            # Start frontend production server
npm run type-check       # Type check both frontend and backend
npm run lint             # Lint both frontend and backend
```

## Directory Structure After Migration

```
mlv-pg-services-website/
├── frontend/
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities (includes api-client.ts)
│   ├── store/                  # Zustand state management
│   ├── styles/                 # Global styles
│   ├── types/                  # TypeScript types
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment template
│   ├── .eslintrc.json          # ESLint config
│   ├── .gitignore              # Git ignore rules
│   ├── netlify.toml            # Netlify configuration
│   ├── next.config.js          # Next.js config
│   ├── package.json            # Frontend dependencies
│   ├── prettier.config.js      # Prettier config
│   ├── postcss.config.js       # PostCSS config
│   ├── tailwind.config.js      # Tailwind config
│   ├── tsconfig.json           # TypeScript config
│   └── middleware.ts           # Supabase session middleware
│
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express app entry point
│   │   ├── config/             # Configuration utilities
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Database models
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helper utilities
│   ├── .env.example            # Environment template
│   ├── .eslintrc.json          # ESLint config
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── dist/                   # Compiled output (generated on build)
│
├── shared/
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   ├── constants/
│   │   └── index.ts            # Shared constants
│   ├── validations/            # Shared validation schemas
│   └── package.json
│
├── package.json                # Root workspace config
├── .gitignore                  # Root Git ignore rules
└── netlify.toml                # Root Netlify config (old - can be deleted)
```

## Key Changes

### Frontend Changes
- All frontend code now in `frontend/` directory
- Supabase client configuration in `frontend/lib/supabase.ts`
- API client in `frontend/lib/api-client.ts` for backend calls
- Can be independently deployed to Netlify
- Environment variables prefixed with `NEXT_PUBLIC_` are client-accessible

### Backend Changes
- All backend code now in `backend/src/` directory
- Entry point: `backend/src/server.ts`
- Structured as: controllers → routes → middleware → services
- Can be independently deployed to Node.js hosting
- Environment variables are server-only (not exposed to client)

### Shared Module
- `shared/types/` - TypeScript interfaces used by both frontend and backend
- `shared/constants/` - Shared constants (user roles, booking statuses, etc.)
- Allows type-safe communication between frontend and backend

## Testing the Migration

```powershell
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Verify health check
curl http://localhost:3001/api/health

# Open browser and test
Start-Process http://localhost:3000
```

## Troubleshooting

### Issue: Port already in use
```powershell
# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3001 (backend)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue: Module not found errors
```powershell
# Clean install
rm -Recurse -Force frontend/node_modules
rm -Recurse -Force backend/node_modules
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Issue: Build fails after migration
```powershell
# Clear Next.js cache
rm -Recurse -Force frontend/.next

# Clear TypeScript cache
cd frontend && npm run build
cd ..
cd backend && npm run build
cd ..
```

## Deployment

### Frontend (Netlify)
- Netlify automatically reads `frontend/netlify.toml`
- Build command: `npm run build`
- Publish directory: `frontend/.next`
- Environment variables: Copy `frontend/.env.example` values to Netlify settings

### Backend (Node.js Hosting)
- Build: `npm run build`
- Start: `npm start`
- Environment variables: Copy `backend/.env.example` values to hosting platform

## Git Configuration

The project is now prepared for GitHub with monorepo support:

```bash
git init
git add .
git commit -m "chore: migrate to monorepo architecture"
git remote add origin <your-repo-url>
git push -u origin main
```

## Next Steps

1. ✅ Monorepo structure created
2. ⏳ Execute migration commands to move files
3. ⏳ Install dependencies for each workspace
4. ⏳ Test builds and runtime
5. ⏳ Update CI/CD pipelines
6. ⏳ Deploy to production
