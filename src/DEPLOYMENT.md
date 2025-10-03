# Deployment Guide - NDKC RFID Attendance System

## Overview

This guide covers deploying the Notre Dame of Kidapawan College RFID Attendance System to production using Supabase as the backend and various hosting platforms for the frontend.

## Prerequisites

- [x] Supabase project set up (see `/SUPABASE_SETUP.md`)
- [x] GitHub repository with your code
- [x] Domain name (optional but recommended)
- [x] SSL certificate (automatically handled by most platforms)

## 1. Configure Supabase Credentials

You have two options for configuring your Supabase credentials:

### Option 1: Edit Config File (Simple but less secure)

Edit `/lib/config.ts` and replace the placeholder values:

```typescript
export const config = {
  supabase: {
    url: 'https://your-project-ref.supabase.co',
    anonKey: 'your-anon-key-here',
  },
  // ... rest of config
}
```

### Option 2: Use window.ENV (Recommended for Production)

Add a script to your deployment's `index.html` or inject via your hosting platform:

```html
<script>
  window.ENV = {
    SUPABASE_URL: 'https://your-project-ref.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here'
  };
</script>
```

For Vercel/Netlify, you can use build-time environment variable replacement:

**Vercel**: Add these as environment variables in your project settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Then configure a build script to inject them.

## 2. Vercel Deployment (Recommended)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add each environment variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Production, Preview, Development
3. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-project-name.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain (e.g., `attendance.ndkc.edu.ph`)
3. Configure DNS records as instructed by Vercel

## 3. Netlify Deployment

### Step 1: Connect Repository

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose GitHub and select your repository

### Step 2: Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18 or higher

### Step 3: Environment Variables

1. Go to "Site settings" → "Environment variables"
2. Add your Supabase environment variables

### Step 4: Deploy

Click "Deploy site" and wait for completion.

## 4. Railway Deployment

### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your repository

### Step 2: Environment Variables

1. Go to your project dashboard
2. Click "Variables" tab
3. Add your environment variables

Railway will automatically detect Next.js and deploy.

## 5. DigitalOcean App Platform

### Step 1: Create App

1. Go to [DigitalOcean](https://digitalocean.com)
2. Click "Create" → "Apps"
3. Connect your GitHub repository

### Step 2: Configure Build

- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Environment**: Node.js

### Step 3: Add Environment Variables

Add your Supabase environment variables in the app settings.

## 6. Self-Hosted Deployment

### Using PM2 (Node.js Process Manager)

```bash
# Install PM2 globally
npm install -pm2 -g

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "ndkc-attendance" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t ndkc-attendance .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=your-url -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key ndkc-attendance
```

## 7. SSL Certificate Setup

### Automatic SSL (Recommended)

Most modern hosting platforms (Vercel, Netlify, etc.) provide automatic SSL certificates. No additional configuration needed.

### Manual SSL Setup

If self-hosting, use Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d attendance.ndkc.edu.ph

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 8. DNS Configuration

### For Custom Domains

Add these DNS records to your domain provider:

```
Type: A
Name: attendance (or @)
Value: [Your hosting provider's IP]

Type: CNAME
Name: www
Value: attendance.ndkc.edu.ph
```

### For Subdomains

```
Type: CNAME
Name: attendance
Value: your-app.vercel.app (or your platform's URL)
```

## 9. Production Checklist

### Before Deployment

- [ ] Environment variables are set correctly
- [ ] Database is initialized with production data
- [ ] Default admin password is changed
- [ ] SSL certificate is configured
- [ ] Custom domain is set up (if applicable)
- [ ] Email templates are customized
- [ ] Row Level Security policies are tested

### After Deployment

- [ ] Test login with admin account
- [ ] Test teacher registration process
- [ ] Test RFID terminal functionality
- [ ] Verify email notifications work
- [ ] Test mobile responsiveness
- [ ] Check performance and loading times
- [ ] Set up monitoring and logging

## 10. Monitoring and Maintenance

### Health Checks

Set up health check endpoints:

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0'
  });
}
```

### Performance Monitoring

Consider integrating:
- **Vercel Analytics** (if using Vercel)
- **Google Analytics** for usage tracking
- **Sentry** for error tracking
- **Uptime Robot** for uptime monitoring

### Database Backup

Set up automatic backups in Supabase:
1. Go to "Settings" → "Database"
2. Enable "Point in Time Recovery" (paid plans)
3. Set up regular database dumps

## 11. Security Considerations

### Environment Security

- Never commit `.env` files to Git
- Use different Supabase projects for development/production
- Regularly rotate API keys
- Enable 2FA on all service accounts

### Application Security

- Keep dependencies updated
- Enable CORS only for your domain
- Use HTTPS everywhere
- Implement rate limiting for API endpoints

### Database Security

- Review Row Level Security policies regularly
- Monitor unusual database activity
- Keep Supabase project updated
- Use strong passwords for all accounts

## 12. Scaling Considerations

### Database Scaling

Supabase handles most scaling automatically, but consider:
- Database connection pooling for high traffic
- Read replicas for reporting queries
- Upgrading to paid plans for better performance

### Frontend Scaling

- Use CDN for static assets (automatic with Vercel/Netlify)
- Implement caching strategies
- Consider serverless functions for API routes
- Monitor bundle size and optimize

## 13. Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Check Node.js version
node --version

# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Environment Variable Issues**
- Verify variables are set correctly
- Check for typos in variable names
- Ensure NEXT_PUBLIC_ prefix for client-side variables

**Database Connection Issues**
- Verify Supabase URL and key
- Check if database is paused (free tier limitation)
- Review network connectivity

### Performance Issues

**Slow Loading**
- Enable compression
- Optimize images
- Check bundle size
- Review database queries

**High Database Usage**
- Add database indexes
- Optimize queries
- Consider caching strategies
- Review RLS policies

## 14. Support and Documentation

### Internal Documentation

Maintain documentation for:
- Deployment procedures
- Environment setup
- Database schema changes
- API endpoints
- User guides

### External Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)

## 15. Backup and Recovery

### Code Backup

- Keep code in Git repository
- Tag releases with version numbers
- Maintain multiple repository backups

### Database Backup

```sql
-- Export data from Supabase dashboard
-- Or use pg_dump for full backups
pg_dump -h db.xxx.supabase.co -U postgres database_name > backup.sql
```

### Configuration Backup

Document all:
- Environment variables
- DNS settings
- SSL certificates
- Third-party integrations

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Contact**: IT Department - Notre Dame of Kidapawan College