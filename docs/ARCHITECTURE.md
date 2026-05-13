# MLV PG Services - Monorepo Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                          │
│              http://localhost:3000                              │
│  - Server-side rendering (App Router)                          │
│  - Client-side routing and interactivity                       │
│  - Supabase authentication (via middleware.ts)                 │
│  - Zustand state management                                    │
│  - TailwindCSS styling                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST API calls
                         │ Authorization: Bearer JWT Token
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│              http://localhost:3001/api                          │
│  - RESTful API endpoints                                        │
│  - JWT token validation middleware                             │
│  - Role-based access control (RBAC)                            │
│  - Database controllers (Supabase/MongoDB)                     │
│  - Business logic services                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌──────────────┐
   │Supabase │    │ MongoDB  │    │ External APIs│
   │PostgreSQL    │(optional)│    │ (WhatsApp, etc)
   └─────────┘    └──────────┘    └──────────────┘
```

## Workspace Organization

### Frontend Workspace (`frontend/`)

**Purpose:** Next.js client application with server-side rendering

**Key Directories:**
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
  - `admin/` - Admin dashboard components
  - `sections/` - Landing page sections
  - `ui/` - Shared UI components
  - `forms/` - Form components
- `hooks/` - Custom React hooks
  - `useFoodMenu.ts` - Food menu data management
  - `useRooms.ts` - Room data management
- `lib/` - Utility functions and configurations
  - `api-client.ts` - Axios API client for backend calls
  - `supabase.ts` - Supabase client for auth
- `store/` - Zustand state stores
  - `authStore.ts` - Authentication state
  - `dashboardStore.ts` - Dashboard state
  - `uiStore.ts` - UI state
- `types/` - TypeScript type definitions
- `styles/` - Global styles and tailwind config
- `public/` - Static assets

**Configuration Files:**
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS theming
- `tsconfig.json` - TypeScript configuration (Next.js specific)
- `middleware.ts` - Supabase session management
- `netlify.toml` - Netlify deployment config

**Build Output:** `.next/` directory (Next.js compiled code)

### Backend Workspace (`backend/`)

**Purpose:** Express.js REST API server

**Key Directories:**
- `src/server.ts` - Application entry point
- `src/config/` - Configuration utilities
  - Environment setup
  - Database connections
- `src/controllers/` - Request handlers
  - `authController.ts` - Authentication handlers
  - `bookingController.ts` - Booking management
  - `roomController.ts` - Room management
- `src/middleware/` - Express middleware
  - `auth.ts` - JWT verification
  - `error.ts` - Error handling
  - `validation.ts` - Input validation
- `src/models/` - Database models/schemas
- `src/routes/` - Route definitions
  - `auth.ts` - Auth endpoints
  - `bookings.ts` - Booking endpoints
  - `rooms.ts` - Room endpoints
- `src/services/` - Business logic
  - Database operations
  - External API integrations
- `src/types/` - TypeScript types
- `src/utils/` - Helper functions

**Configuration Files:**
- `tsconfig.json` - TypeScript configuration (Node.js specific)
- `.env.example` - Environment variables template
- `.eslintrc.json` - Linting rules

**Build Output:** `dist/` directory (Compiled JavaScript)

### Shared Workspace (`shared/`)

**Purpose:** Shared types and constants between frontend and backend

**Key Files:**
- `types/index.ts` - Shared TypeScript interfaces
  - `User`, `Booking`, `Room`, `ApiResponse`
  - Authentication types
  - Pagination types
- `constants/index.ts` - Shared constants
  - User roles
  - Booking statuses
  - Room types
  - UI labels and enums

**Why Separate:** Prevents code duplication and ensures type safety across frontend/backend communication

## Data Flow

### Authentication Flow

```
User Input (Login)
  ↓
Frontend: ContactForm → authStore.login()
  ↓
API Call: POST /api/auth/login
  ↓
Backend: authController.login()
  ↓
Database: Query user, verify password
  ↓
Response: { user: {...}, token: "jwt...", refreshToken: "..." }
  ↓
Frontend: Store tokens in localStorage + update authStore
  ↓
Display: Redirect to dashboard
```

### API Request Flow

```
User Action (e.g., Book Room)
  ↓
Frontend: Component calls api.bookings.create(bookingData)
  ↓
API Client (lib/api-client.ts):
  - Reads token from localStorage
  - Adds: Authorization: "Bearer <token>" header
  - Sends: POST /api/bookings
  ↓
Backend Middleware:
  - Validates JWT token
  - Attaches user data to request
  - Checks permissions (RBAC)
  ↓
Backend Controller:
  - Validates input data (Zod schema)
  - Calls service layer (business logic)
  ↓
Backend Service:
  - Interacts with database
  - Performs calculations
  - Returns result
  ↓
Backend Controller:
  - Formats response
  - Returns: { success: true, data: {...} }
  ↓
Frontend:
  - Updates Zustand store
  - Triggers UI update
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get logged-in user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - List all users (admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Rooms
- `GET /api/rooms` - List rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

## State Management

### Frontend State (Zustand Stores)

**authStore.ts**
```typescript
{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login(email, password)
  logout()
  updateProfile(data)
}
```

**dashboardStore.ts**
```typescript
{
  bookings: Booking[]
  rooms: Room[]
  selectedRoom: Room | null
  isLoading: boolean
  fetchBookings()
  fetchRooms()
}
```

**uiStore.ts**
```typescript
{
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  toggleSidebar()
  toggleTheme()
  addNotification(message)
}
```

## Environment Configuration

### Frontend (frontend/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (backend/.env.local)
```
NODE_ENV=development
PORT=3001
JWT_SECRET=...
SUPABASE_URL=...
CORS_ORIGIN=http://localhost:3000
```

## Development Workflow

### Local Development

```bash
# Terminal 1: Start frontend
cd frontend
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Start backend
cd backend
npm run dev
# Runs on http://localhost:3001

# Terminal 3: (Optional) Watch for shared type changes
cd shared
npm watch
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Or individually
npm run build:frontend  # Generates .next/
npm run build:backend   # Generates dist/
```

### Type Checking

```bash
# Check types across all workspaces
npm run type-check

# Or individually
npm run type-check:frontend
npm run type-check:backend
```

## Deployment

### Frontend Deployment (Netlify)
- Automatically deploys from `frontend/` directory
- Build command: `npm run build`
- Publish directory: `.next`
- Environment: Uses `frontend/.env` variables

### Backend Deployment (Node.js)
- Deploy `backend/dist/` directory
- Start command: `npm start`
- Environment: Uses `backend/.env` variables
- Recommended hosts: Heroku, Railway, Render, Fly.io

## Testing Strategy

### Unit Tests
```bash
cd frontend && npm test
cd backend && npm test
```

### Integration Tests
```bash
# Test API endpoints with frontend client
npm run test:integration
```

### End-to-End Tests
```bash
# Full user journey testing
npm run test:e2e
```

## Security Considerations

### Frontend
- JWT tokens stored in localStorage (consider IndexedDB for sensitive apps)
- CORS headers configured on backend
- Supabase RLS (Row Level Security) for database access

### Backend
- JWT middleware validates all requests
- RBAC (Role-Based Access Control) for authorization
- Input validation with Zod schemas
- CORS whitelist for frontend origin
- Environment variables never exposed to client

## Performance Optimizations

### Frontend
- Code splitting with Next.js dynamic imports
- Image optimization with Next/Image
- CSS @keyframes animations instead of JS
- Zustand for minimal state updates
- React Query for efficient data fetching

### Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Connection pooling for database
- Caching layer (Redis) optional
- Compression middleware for responses

## Scaling Considerations

### Horizontal Scaling
- Frontend: Stateless, scales easily on Netlify/Vercel
- Backend: Stateless API, scales with load balancer + multiple instances
- Database: Use Supabase managed services or MongoDB Atlas

### Vertical Scaling
- Upgrade Node.js version for better performance
- Increase database connection limits
- Optimize SQL queries with explain plans

## Monitoring & Logging

### Frontend
- Sentry for error tracking
- Google Analytics for user behavior
- Console logging in development

### Backend
- Winston for structured logging
- Sentry for error tracking
- CloudWatch or similar for production monitoring

## Documentation

- **Setup:** See MONOREPO_MIGRATION_GUIDE.md
- **API Reference:** See backend/README.md (to be created)
- **Frontend Guide:** See frontend/README.md (to be created)
- **Database Schema:** See backend/docs/DATABASE.md (to be created)
