# Frontend - MLV PG Services

Next.js 16 application for the MLV PG Services booking platform.

## 🏗️ Project Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── (app)/                     # Landing page routes
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx
│   │   └── layout/               # Layout page
│   ├── (auth)/                    # Auth routes (login, signup)
│   │   ├── login/
│   │   └── signup/
│   └── admin/                     # Admin dashboard routes
│       ├── bookings/
│       ├── dashboard/
│       ├── rooms/
│       ├── users/
│       └── ...
├── components/
│   ├── admin/                     # Admin-specific components
│   ├── sections/                  # Landing page sections
│   ├── ui/                        # Reusable UI components
│   ├── forms/                     # Form components
│   └── ...
├── hooks/                         # Custom React hooks
│   ├── useFoodMenu.ts
│   ├── useRooms.ts
│   └── ...
├── lib/
│   ├── api-client.ts              # Axios API client
│   ├── supabase.ts                # Supabase client
│   ├── utils/                     # Utility functions
│   └── validations/               # Zod schemas
├── store/                         # Zustand stores
│   ├── authStore.ts
│   ├── dashboardStore.ts
│   └── uiStore.ts
├── styles/                        # Global styles
│   └── globals.css
├── types/                         # TypeScript types
│   └── index.ts
├── public/                        # Static assets
├── middleware.ts                  # Supabase session middleware
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Key Dependencies

### Framework & Rendering
- **next** 16.2.6 - React framework with SSR
- **react** 19.0.0 - UI library
- **react-dom** 19.0.0 - DOM rendering

### Styling & Animation
- **tailwindcss** 3.3.0 - Utility-first CSS
- **motion** 11.11.0 - React animations (replaced framer-motion)
- **@tailwindcss/forms** 0.5.11 - Form styling

### State Management
- **zustand** 5.0.13 - Lightweight state management
- **@tanstack/react-query** 5.100.9 - Server state management
- **react-hook-form** 7.48.0 - Form state management

### Data & API
- **@supabase/supabase-js** 2.38.0 - Supabase client
- **@supabase/ssr** 0.10.3 - SSR support for Supabase
- **axios** 1.6.0 - HTTP client
- **zod** 3.22.0 - Data validation

### UI & Components
- **lucide-react** 0.292.0 - Icon library
- **recharts** 3.8.1 - Chart library
- **sonner** 1.2.0 - Toast notifications
- **clsx** 2.0.0 - Conditional CSS classes
- **tailwind-merge** 2.2.0 - Merge Tailwind classes

### Utilities
- **browser-image-compression** 2.0.2 - Image compression
- **react-hook-form-persist** 3.0.0 - Persist form state

## 🔗 API Integration

The frontend communicates with the backend via `lib/api-client.ts`:

### Usage Example

```typescript
import { api } from '@/lib/api-client'

// Authentication
const { data } = await api.auth.login(email, password)

// Bookings
const { data: bookings } = await api.bookings.getAll()
const { data: booking } = await api.bookings.getById(bookingId)
await api.bookings.create(bookingData)
await api.bookings.update(bookingId, updatedData)
await api.bookings.delete(bookingId)

// Rooms
const { data: rooms } = await api.rooms.getAll()
const { data: room } = await api.rooms.getById(roomId)

// Users
const { data: profile } = await api.users.getProfile()
await api.users.updateProfile(profileData)
```

## 🔐 Authentication Flow

1. User submits login form
2. Frontend calls `api.auth.login(email, password)`
3. Backend validates credentials and returns JWT tokens
4. Frontend stores tokens in localStorage (via authStore)
5. API client automatically includes token in Authorization header
6. Supabase middleware validates session on each request

### Auth Store Usage

```typescript
import { useAuthStore } from '@/store/authStore'

export function LoginForm() {
  const { login, isLoading } = useAuthStore()
  
  const handleSubmit = async (credentials) => {
    await login(credentials.email, credentials.password)
    // Redirects to dashboard on success
  }
  
  return (...)
}
```

## 🎨 Styling

### Tailwind CSS

All styling uses Tailwind utility classes:

```tsx
<div className="bg-blue-500 text-white rounded-lg p-4">
  <h1 className="text-2xl font-bold">Hello</h1>
</div>
```

### Global Styles

Global styles in `styles/globals.css`:
- Tailwind directives (@tailwind)
- CSS variables
- Custom @keyframes animations

### CSS Animations

Instead of framer-motion animations, use:
- CSS @keyframes in globals.css
- Tailwind animation utilities
- motion/react library for interactive animations

## 🚀 Building & Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deployment to Netlify

```bash
git push origin main
```

The repository is automatically deployed via Netlify (configured in `netlify.toml`).

### Environment Variables for Production

Set in Netlify dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (production backend URL)

## 🧪 Testing & Quality

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## 🔍 Debugging

### Client-Side

1. Open browser DevTools (F12)
2. Use Console tab for logs
3. Use React DevTools extension
4. Use Next.js DevTools overlay

### With VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📝 Common Tasks

### Add a New Page

1. Create folder in `app/` (e.g., `app/my-page/`)
2. Create `page.tsx` file
3. Next.js automatically creates route `/my-page`

### Add a Component

1. Create in `components/` with TypeScript file
2. Export React component
3. Import in other components

### Add Form Validation

1. Create Zod schema in `lib/validations/`
2. Use with react-hook-form in component
3. Display validation errors

### Fetch Data from API

1. Use custom hook or directly call `api` client
2. Use React Query for server state
3. Update Zustand store on success

### Add State Management

1. Create store in `store/` folder
2. Define state and actions with Zustand
3. Use `useStore()` hook in components

## 🐛 Troubleshooting

### Issue: Module not found errors
```bash
# Clear cache and reinstall
rm -r node_modules .next
npm install
npm run dev
```

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Supabase connection fails
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify RLS policies allow anonymous access

### Issue: API requests fail with 401 Unauthorized
- Check token is being sent in Authorization header
- Verify token hasn't expired
- Try logging out and back in

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Hook Form Documentation](https://react-hook-form.com)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run format` to format code
4. Run `npm run type-check` to verify types
5. Commit and push

---

**Last Updated:** 2024
