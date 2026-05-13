# Netlify Build Troubleshooting & Fixes

## Issues Fixed

### 1. Build Command Updated
**File**: `netlify.toml`
- Changed from: `command = "npm run build"`
- Changed to: `command = "npm ci && npm run build"`
- **Why**: `npm ci` (clean install) ensures all dependencies including devDependencies are properly installed

### 2. Node Version Specified
**Files**: `netlify.toml` and `.nvmrc`
- Added explicit Node.js version: `20.x` (LTS)
- `.nvmrc` specifies `20.10.0` for local development consistency
- **Why**: Ensures Netlify uses compatible Node version for Next.js 15

### 3. Environment Configuration
**netlify.toml**
```toml
[build]
  command = "npm ci && npm run build"
  environment = { NODE_VERSION = "20.x" }
```

## What Was Fixed

### Dependencies Issue
- ✅ `tailwindcss` is in `devDependencies` (correct for Next.js)
- ✅ `npm ci` installs all dependencies including dev deps
- ✅ Node.js version explicitly set

### Missing Components
- ✅ `Navbar.tsx` - exists at `components/ui/Navbar.tsx`
- ✅ `Footer.tsx` - exists at `components/ui/Footer.tsx`
- ✅ `WhatsAppButton.tsx` - exists at `components/ui/WhatsAppButton.tsx`
- ✅ All components properly exported as named exports

### Path Aliases
- ✅ `@/components/*` resolves to `./components/*` (verified in tsconfig.json)
- ✅ All imports use correct path syntax

## Next Deployment Steps

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "fix: update netlify build configuration for reliable deploys"
   git push origin main
   ```

2. **Trigger new build**:
   - Go to Netlify Dashboard
   - Deploys → "Trigger deploy" → "Deploy site"
   - Monitor build logs

3. **Verify build succeeds**:
   - Check "Deploy log" for successful completion
   - Look for "Site is live" message
   - Test at your-site.netlify.app

## If Build Still Fails

### Common Issues & Fixes

**Issue**: "Cannot find module 'tailwindcss'"
- Solution: Verify `npm ci` is running (see netlify.toml)
- Solution: Check Node version in Netlify dashboard (should be 20.x)

**Issue**: "Module not found: @/components/ui/Navbar"
- Solution: Verify files exist in `components/ui/`
- Solution: Check `tsconfig.json` path aliases
- Solution: Ensure no `.gitignore` is excluding component files

**Issue**: Build times exceeding 15 minutes
- Solution: Clear Netlify cache (Deploys → Deployment settings → "Garbage collection")
- Solution: Check for heavy dependencies in package.json
- Solution: Run `npm list` locally to verify dependency tree

### Manual Debugging
```bash
# Test build locally first
npm ci
npm run build

# Verify all imports work
npm run type-check

# Check for linting issues
npm run lint
```

## Production Environment Variables

Required in Netlify Dashboard (Site settings → Build & deploy → Environment):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_API_BASE_URL=https://your-site.netlify.app/api
NODE_VERSION=20.x
```

## Build Configuration Summary

| Setting | Value | Purpose |
|---------|-------|---------|
| Build Command | `npm ci && npm run build` | Clean install + Next.js build |
| Publish Directory | `.next` | Next.js output directory |
| Node Version | `20.x` | LTS Node version |
| Functions | `netlify/functions` | Serverless functions (if used) |

## Files Modified
- ✅ `netlify.toml` - Updated build command and Node version
- ✅ `.nvmrc` - Created for Node version consistency
- ✅ No changes needed to `package.json` or component files

---

**Status**: ✅ Build configuration fixed and ready for deployment
**Next Action**: Push to main branch and trigger Netlify build
