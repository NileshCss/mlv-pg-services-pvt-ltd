# Deployment Guide

## 🚀 Deploying MLV PG Services

### Option 1: Heroku (Easiest for Backend)

**Prerequisites:**
- Heroku account
- Git installed
- Heroku CLI

**Steps:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASSWORD=your-app-password
heroku config:set ADMIN_EMAIL=admin@mlvpg.com

# Deploy
git push heroku main
```

### Option 2: AWS (Production)

**Backend on EC2/Elastic Beanstalk:**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-14 mlv-pg-backend

# Create environment
eb create mlv-pg-prod

# Deploy
eb deploy
```

**Frontend on S3 + CloudFront:**
1. Upload frontend files to S3
2. Create CloudFront distribution
3. Update API_BASE_URL to backend URL

### Option 3: Docker

**Dockerfile for Backend:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Build and Run:**
```bash
docker build -t mlv-pg-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=your-connection-string \
  mlv-pg-backend
```

### Option 4: DigitalOcean

**Droplet Setup:**
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone project
git clone your-repo-url
cd mlv_pg_services_website/backend

# Install dependencies
npm install

# Start with PM2
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

## 🌐 Frontend Deployment

### Static Hosting (S3, Netlify, Vercel)

**Steps:**
1. Update `API_BASE_URL` in `frontend/js/config.js`
2. Upload `frontend/` folder
3. Configure custom domain

### Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=frontend
```

### GitHub Pages

```bash
# Push to gh-pages branch
git subtree push --prefix frontend origin gh-pages
```

## 📊 Environment Configuration

### Production `.env`
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mlv_pg
GMAIL_USER=noreply@mlvpg.com
GMAIL_PASSWORD=app-password
ADMIN_EMAIL=admin@mlvpg.com
JWT_SECRET=your-secure-secret
CORS_ORIGIN=https://yourdomain.com
```

### Frontend Configuration
Update `frontend/js/config.js`:
```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] Email credentials verified
- [ ] CORS origins updated
- [ ] SSL certificate installed
- [ ] API endpoints tested
- [ ] Frontend built for production
- [ ] Admin password changed
- [ ] Security headers configured
- [ ] Rate limiting enabled

## 🔒 Security Hardening

### Backend Security
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Add helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

### Nginx Configuration
```nginx
server {
  listen 443 ssl;
  server_name api.yourdomain.com;
  
  ssl_certificate /path/to/cert;
  ssl_certificate_key /path/to/key;
  
  location / {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 📈 Monitoring & Logging

### Uptime Monitoring
- Use UptimeRobot for health checks
- Set webhook to `/api/health`

### Error Logging
```bash
# Use cloud logging
npm install winston
npm install @sentry/node
```

### Database Backup
```bash
# Daily backup script
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/mlv_pg" \
  --archive=backup-$(date +%Y%m%d).archive
```

## 🎯 Performance Optimization

### Frontend
- Minify CSS/JS
- Compress images
- Enable caching
- Use CDN for assets

### Backend
- Enable compression
- Add caching headers
- Use database indexing
- Implement pagination

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs`
- Test API: `curl http://localhost:5000/api/health`
- Verify database: `mongodb compass`

---

**Last Updated:** May 2024
