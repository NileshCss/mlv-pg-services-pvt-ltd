# Netlify Deployment Guide

## Quick Start

### 1. Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select GitHub, GitLab, or Bitbucket
4. Choose your `mlv_pg_services_website` repository
5. Click "Deploy site"

### 2. Configure Build Settings
Netlify should auto-detect Next.js, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18.x or 20.x (set in `netlify.toml` or Netlify dashboard)

### 3. Set Environment Variables
Go to **Site settings** → **Build & deploy** → **Environment**

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_API_BASE_URL=https://your-site.netlify.app/api
NODE_ENV=production
```

### 4. Deploy
- Push to main branch (or configured branch)
- Netlify automatically builds and deploys

---

## Configuration Files

### netlify.toml
Already configured with:
- ✅ Next.js 15 build setup
- ✅ Cache headers for performance
- ✅ Security headers
- ✅ CORS configuration for Supabase
- ✅ Redirects for client-side routing

### next.config.js
Already optimized:
- ✅ Compression enabled
- ✅ SWC minification (default in Next.js 15)
- ✅ ETags for caching
- ✅ Image optimization
- ✅ Security headers removed (Netlify handles via netlify.toml)

---

## Common Issues & Solutions

### Issue 1: Build Fails with "swcMinify is not recognized"
**Solution**: ✅ Already fixed in next.config.js
- Removed deprecated `swcMinify: true` 
- SWC is default minifier in Next.js 15

### Issue 2: "optimizeFonts is not recognized"
**Solution**: ✅ Already fixed in next.config.js
- Removed deprecated `optimizeFonts: true`
- Fonts optimized via display:swap in layout.tsx

### Issue 3: Build Times Exceed 15 Minutes
**Solution**:
1. Check dependencies size: `npm list`
2. Clear build cache: Site settings → Deploys → Clear cache & trigger redeploy
3. Upgrade Node version: Set `NODE_VERSION=20` in environment variables

### Issue 4: Supabase Queries Failing on Deploy
**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys in environment
- Check Supabase project is reachable (not in IP whitelist)
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for admin operations
- Verify RLS policies allow anonymous access where needed

### Issue 5: Images Not Loading
**Solution**:
- Verify image domains in next.config.js (already configured for Unsplash & Supabase)
- Check image URLs are HTTPS
- Netlify caches images for 1 year, clear cache if needed

### Issue 6: Static Assets Returning 404
**Solution**:
- Next.js outputs to `.next` directory (already configured)
- Check `publish` directory is set to `.next` in netlify.toml
- Public folder files available at root (e.g., `/images/logo.png`)

---

## Performance Optimization

### Build Optimization
- **Compression**: Gzip/Brotli enabled (netlify.toml + next.config.js)
- **Minification**: SWC (default in Next.js 15)
- **Cache headers**: 1 year for static, 1 hour for API

### Browser Caching
```
/_next/static/*          → 1 year (immutable)
/images/*                → 1 year (immutable)
/api/*                   → 1 hour (with CDN cache)
```

### Further Optimization
1. **Netlify Analytics**: Enable in dashboard for Core Web Vitals
2. **Netlify Edge Functions**: Deploy close to users
3. **Netlify Image Optimization**: Enable image transforms
4. **Database Indexing**: Add indexes to frequently queried columns in Supabase

---

## Monitoring & Debugging

### Real-Time Logs
- Go to **Deploys** → Click deployment → **Deploy log**
- Watch for build errors and API failures

### Analytics
- **Netlify Analytics**: Core Web Vitals, performance
- **Supabase Dashboard**: Query performance, error logs
- **Sentry (Optional)**: Error tracking and monitoring

### Health Checks
```bash
# Test API health
curl https://your-site.netlify.app/api/health

# Verify Supabase connection
curl https://your-site.netlify.app/api/registrations
```

---

## Environment Variables Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | `eyJ...` (JWT token) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Yes | `eyJ...` (service role) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public | No | `919876543210` |
| `NEXT_PUBLIC_API_BASE_URL` | Public | Yes | `https://your-site.netlify.app/api` |
| `NODE_ENV` | Secret | Yes | `production` |
| `NODE_VERSION` | Secret | No | `20` (defaults to 18) |

---

## Rollback & Recovery

### Rollback to Previous Deploy
1. Go to **Deploys**
2. Right-click previous deploy → **Publish deploy**

### Clear Build Cache
1. Site settings → **Deploys**
2. Click **Clear cache and trigger rebuild**

### View Deployment Diff
1. **Deploys** → Click deployment
2. Shows Git commits and files changed

---

## Production Checklist

- [ ] Environment variables set (not in code)
- [ ] Supabase service role key secured
- [ ] Email notifications configured (optional)
- [ ] Custom domain set up
- [ ] SSL certificate auto-renews (Netlify default)
- [ ] Analytics enabled
- [ ] Error monitoring configured
- [ ] Database backups scheduled
- [ ] RLS policies reviewed
- [ ] Staging environment tested before production deploy

---

## Useful Netlify Commands

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link project
netlify link

# Local preview
netlify dev

# Deploy site
netlify deploy --prod

# Check site status
netlify status

# View logs
netlify logs
```

---

## Support Links

- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js 15 Deployment](https://nextjs.org/docs/deployment)
- [Supabase Netlify Guide](https://supabase.com/docs/guides/platform/examples/netlify)
- [Netlify Support](https://support.netlify.com)

---

**Last Updated**: May 2026  
**Status**: ✅ Ready for Production Deployment
