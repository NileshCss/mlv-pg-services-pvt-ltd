# Pre-Deployment Checklist

## Local Testing (Before Pushing)

### 1. Dependencies ✅
- [x] Run `npm ci` locally to test clean install
- [x] `tailwindcss` present in `devDependencies` (correct for Next.js)
- [x] All component files exist in `components/ui/`

### 2. Build Verification ✅
```bash
# Clean install to match Netlify behavior
npm ci

# Build the project
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### 3. Component Imports ✅
**File**: `app/(app)/page.tsx`
- [x] `import { Navbar } from '@/components/ui/Navbar'` ✓
- [x] `import { Footer } from '@/components/ui/Footer'` ✓
- [x] `import { WhatsAppButton } from '@/components/ui/WhatsAppButton'` ✓

**File**: `components/ui/Navbar.tsx`
- [x] Component defined as `const Navbar: React.FC<NavbarProps>`
- [x] Export: `export { Navbar }`

**File**: `components/ui/Footer.tsx`
- [x] Component defined properly
- [x] Export: `export { Footer }`

**File**: `components/ui/WhatsAppButton.tsx`
- [x] Component defined properly
- [x] Export: `export { WhatsAppButton }`

### 4. Configuration Files ✅
- [x] `tsconfig.json` - Path aliases properly configured
- [x] `next.config.js` - Valid Next.js 15 config
- [x] `netlify.toml` - Updated with `npm ci && npm run build`
- [x] `.nvmrc` - Node version specified (20.10.0)
- [x] `package.json` - All dependencies correctly listed

### 5. Environment Variables ✅
Verify these are set in Netlify Dashboard:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] `NEXT_PUBLIC_API_BASE_URL`
- [ ] `NODE_VERSION=20.x` (optional but recommended)

## Deployment Steps

### Step 1: Git Commit
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "fix: update netlify build config and add missing deployment files

- Update netlify.toml to use npm ci for reliable dependency installation
- Add .nvmrc to specify Node version (20.10.0)
- Add NETLIFY_BUILD_FIXES.md with troubleshooting guide
- All components (Navbar, Footer, WhatsAppButton) are present and properly exported"

# Push to main
git push origin main
```

### Step 2: Trigger Netlify Build
1. Go to Netlify Dashboard
2. Select your site
3. Click "Deploys"
4. Click "Trigger deploy" → "Deploy site"
5. Monitor the deployment:
   - ✅ Dependencies installed (should see npm ci output)
   - ✅ Build command executes (`npm run build`)
   - ✅ Build completes without errors
   - ✅ Site deploys to live URL

### Step 3: Verify Deployment
1. Check site at `your-site.netlify.app`
2. Verify all sections load:
   - [ ] Hero section renders
   - [ ] Navigation bar present
   - [ ] All page sections load (About, Facilities, Rooms, etc.)
   - [ ] Footer appears at bottom
   - [ ] WhatsApp button visible in bottom-right
   - [ ] Pre-registration popup works
3. Test interactions:
   - [ ] Click "Book Now" buttons
   - [ ] Navigate with navbar links
   - [ ] WhatsApp button redirects correctly

### Step 4: Monitor Performance
- Open DevTools (F12)
- Check Console for errors
- Check Network for failed requests
- Monitor Lighthouse score

## Rollback Plan (If Needed)

If deployment fails:
1. Go to Netlify Deploys
2. Right-click previous successful deploy
3. Click "Publish deploy"
4. Site reverts to previous version immediately

## Troubleshooting

### Build Fails with "npm not found"
- Check Node version: `node --version` (should be 18+ or 20.x)
- Solution: Netlify uses Node 18 by default, set `NODE_VERSION=20.x` in environment

### Build Fails with "Cannot find module 'tailwindcss'"
- Solution: Already fixed in netlify.toml (uses `npm ci`)
- Verify: netlify.toml command shows `npm ci &&`

### Build Fails with "Module not found: @/components/ui/Navbar"
- Solution: Check tsconfig.json `paths` configuration
- Verify: All component files exist in `components/ui/`
- Verify: Components have proper exports

### Site Deploys but Pages Blank
- Check DevTools Console for errors
- Verify environment variables are set
- Check Supabase connection

### Performance Issues
- Clear Netlify cache: Deploys → Settings → "Garbage collection"
- Check bundle size: `npm run build` shows build summary
- Monitor Core Web Vitals: Netlify Analytics

## Support Resources

- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js 15 Deployment](https://nextjs.org/docs/deployment)
- [Netlify Build Documentation](https://docs.netlify.com/configure-builds/overview/)

---

**Status**: Ready for deployment  
**Last Updated**: May 13, 2026  
**Next Action**: Commit changes and trigger Netlify build
