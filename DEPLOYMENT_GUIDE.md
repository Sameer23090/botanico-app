# 🚀 Deployment Guide - Botanico

Complete guide to deploying Botanico to production.

## 📋 Pre-Deployment Checklist

- [ ] Backend code is tested and working locally
- [ ] Frontend code is tested and working locally
- [ ] Environment variables are documented
- [ ] Database schema is finalized
- [ ] Cloudinary account is set up
- [ ] All API endpoints are secured
- [ ] CORS is properly configured
- [ ] Error handling is implemented
- [ ] Loading states are in place

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Why Railway?**
- Free PostgreSQL database included
- Zero configuration deployment
- Automatic HTTPS
- Easy environment variables
- Git-based deployments

**Steps:**

1. **Sign up**: Go to [railway.app](https://railway.app)

2. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

3. **Deploy Backend**:
```bash
cd backend
railway init
railway add postgresql  # Adds PostgreSQL database
railway up
```

4. **Set Environment Variables** in Railway dashboard:
```
NODE_ENV=production
JWT_SECRET=your-production-secret-change-this
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

5. **Run Database Migration**:
```bash
railway run psql < schema.sql
```

6. **Get Backend URL**: Copy from Railway dashboard (e.g., `https://botanico-backend.up.railway.app`)

7. **Deploy Frontend**:
```bash
cd ../frontend
npm install -g vercel
vercel
```

8. **Set Frontend Environment Variable**:
```bash
vercel env add VITE_API_URL
# Enter: https://your-backend-url.up.railway.app/api
```

9. **Deploy to Production**:
```bash
vercel --prod
```

**✅ Done! Your app is live!**

---

### Option 2: Render.com + Vercel

**Backend on Render:**

1. Go to [render.com](https://render.com)
2. Create account and click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Configure:
   - Name: botanico-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables (same as above)
7. Create PostgreSQL Database
8. Click "Create Web Service"

**Frontend on Vercel:**
(Same as Option 1, step 7-9)

---

### Option 3: DigitalOcean App Platform

1. Go to [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)
2. Create App
3. Connect GitHub repository
4. Configure backend:
   - Type: Web Service
   - Environment Variables: (add all)
5. Add PostgreSQL Database
6. Configure frontend:
   - Type: Static Site
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Deploy

---

### Option 4: Heroku (Classic)

**Backend:**
```bash
cd backend
heroku create botanico-backend
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set CLOUDINARY_CLOUD_NAME=your-name
# ... add all env vars
git push heroku main
heroku run npm run migrate
```

**Frontend:**
Use Netlify or Vercel (see below)

---

### Option 5: AWS (Advanced)

**Backend:**
- EC2 instance with Node.js
- RDS PostgreSQL database
- S3 for static files (if not using Cloudinary)
- CloudFront CDN
- Route 53 for DNS

**Frontend:**
- S3 bucket for static hosting
- CloudFront distribution
- Route 53 for custom domain

(Detailed AWS guide requires separate documentation)

---

## 🎨 Frontend Deployment Details

### Vercel (Recommended)

```bash
cd frontend
npm install -g vercel
vercel login
vercel
# Follow prompts
vercel --prod
```

**Environment Variables in Vercel:**
1. Go to project settings
2. Click "Environment Variables"
3. Add:
   - `VITE_API_URL` = `https://your-backend-url.com/api`

### Netlify

```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔒 Production Security Checklist

### Backend
- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins
- [ ] Rate limit API endpoints
- [ ] Sanitize all user inputs
- [ ] Use parameterized SQL queries
- [ ] Enable Helmet security headers
- [ ] Set up monitoring/logging
- [ ] Regular dependency updates

### Frontend
- [ ] Remove console.logs
- [ ] Minify/optimize build
- [ ] Enable gzip compression
- [ ] Set up CDN
- [ ] Optimize images
- [ ] Add meta tags for SEO
- [ ] Set up error tracking (Sentry)

### Database
- [ ] Regular backups
- [ ] Connection pooling
- [ ] Indexes on frequently queried columns
- [ ] SSL/TLS connections
- [ ] Strong passwords
- [ ] Limited access permissions

---

## 📊 Monitoring & Analytics

### Backend Monitoring
**Options:**
- Railway built-in logs
- LogRocket
- New Relic
- DataDog

### Error Tracking
**Frontend & Backend:**
```bash
npm install @sentry/react @sentry/node
```

### Analytics
**Frontend:**
- Google Analytics
- Plausible (privacy-friendly)
- Mixpanel

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          cd backend
          railway up
          
      - name: Deploy Frontend  
        run: |
          cd frontend
          npm install
          npm run build
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🌍 Custom Domain Setup

### Backend (Railway)
1. Go to Railway project
2. Click "Settings" → "Domains"
3. Add custom domain
4. Update DNS records:
   - Type: CNAME
   - Name: api
   - Value: your-app.up.railway.app

### Frontend (Vercel)
1. Go to Vercel project settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records as instructed

---

## 🐛 Common Deployment Issues

### Issue: "Cannot connect to database"
**Fix:**
- Check DATABASE_URL format
- Ensure database is running
- Check firewall/security groups
- Verify SSL settings

### Issue: "CORS error"
**Fix:**
- Update FRONTEND_URL in backend .env
- Check CORS configuration in server.js
- Ensure credentials: true is set

### Issue: "Images not uploading"
**Fix:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure multer is configured correctly

### Issue: "JWT token invalid"
**Fix:**
- Ensure JWT_SECRET matches between environments
- Check token expiration settings
- Verify token is being sent in headers

### Issue: "Build fails"
**Fix:**
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Review build logs for specific errors

---

## 📈 Performance Optimization

### Backend
- [ ] Enable database connection pooling
- [ ] Add Redis for caching
- [ ] Implement rate limiting
- [ ] Use database indexes
- [ ] Enable gzip compression
- [ ] Optimize image uploads

### Frontend
- [ ] Code splitting
- [ ] Lazy loading images
- [ ] Minify assets
- [ ] Use CDN for static files
- [ ] Enable service worker
- [ ] Optimize bundle size

---

## 🔐 Environment Variables Management

### Development
```
backend/.env
frontend/.env
```

### Production
**Railway:**
- Set in dashboard under "Variables"

**Vercel:**
- Set in project settings → Environment Variables

**Render:**
- Set in service settings → Environment

**Never commit .env files to Git!**

---

## 📱 Post-Deployment Testing

### Checklist
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Create a plant
- [ ] Upload photos
- [ ] Add daily updates
- [ ] View timeline
- [ ] Edit entries
- [ ] Delete entries
- [ ] Test on mobile
- [ ] Test on different browsers
- [ ] Check image uploads
- [ ] Verify email notifications (if added)
- [ ] Test error scenarios

---

## 🎉 Launch Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database is backed up
- [ ] Environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] Monitoring is set up
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Documentation is updated
- [ ] README has production URLs
- [ ] Team has access to dashboards

---

## 📞 Support

If you encounter issues during deployment:

1. Check deployment logs
2. Review environment variables
3. Test database connection
4. Verify API endpoints
5. Check CORS settings

**Still stuck?**
- Railway support: support@railway.app
- Vercel support: https://vercel.com/support
- Community: Stack Overflow with tags: nodejs, react, postgresql

---

**Happy Deploying! 🚀**

Your Botanico app will be live and helping people track their plants in no time!
