# 🚀 Quick Netlify Setup for AI Audit Tool

## 5-Minute Deployment Guide

### Step 1: Push to Git (if not done)
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Step 2: Create Netlify Site
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider and select the AI Audit repository
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click **"Deploy site"**

### Step 3: Add Environment Variables
Go to **Site Settings** → **Environment Variables** and add:

```
DATABASE_URL = your-database-connection-string
N8N_WEBHOOK_URL = https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd
NEXT_PUBLIC_N8N_WEBHOOK_URL = https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd
NEXTAUTH_SECRET = your-32-character-secret-key
NEXTAUTH_URL = https://audit.yourdomain.com
```

### Step 4: Set Up Custom Domain
1. In Netlify Dashboard → **Domain Settings**
2. Click **"Add custom domain"**
3. Enter: `audit.yourdomain.com`
4. Update your DNS records:
   ```
   Type: CNAME
   Name: audit
   Value: your-netlify-site-name.netlify.app
   ```

### Step 5: Database Setup (Choose One)

#### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Update `DATABASE_URL` in Netlify

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string
4. Update `DATABASE_URL` in Netlify

### Step 6: Test Deployment
1. **Health Check**: `https://your-site.netlify.app/api/health`
2. **Submit Test Audit**: Fill out the form
3. **Check PDF Storage**: Verify PDFs are generated

## 🔗 Integration with Main Site

Add this to your main website:
```html
<a href="https://audit.yourdomain.com" class="audit-cta">
  Get Your Free AI Audit Report
</a>
```

## 📊 Monitoring

Bookmark these URLs:
- **Netlify Dashboard**: https://app.netlify.com/sites/your-site-name
- **Health Check**: https://audit.yourdomain.com/api/health
- **Function Logs**: Netlify Dashboard → Functions tab

## 🚨 Troubleshooting

**Build fails?**
- Check Node.js version is 18.x in build settings
- Verify all dependencies are in package.json

**Database connection fails?**
- Double-check DATABASE_URL format
- Ensure database allows external connections

**API routes not working?**
- Verify @netlify/plugin-nextjs is configured in netlify.toml
- Check function logs in Netlify Dashboard

## ✅ Success Checklist

- [ ] Site deployed to Netlify
- [ ] Custom domain configured
- [ ] Environment variables set
- [ ] Database connected
- [ ] Health check passes
- [ ] Test audit submission works
- [ ] PDF generation works
- [ ] Main website updated with link

**Your AI Audit tool is now live! 🎉**
