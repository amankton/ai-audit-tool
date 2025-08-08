# AI Audit Tool - Netlify Deployment Guide

## 🎯 Deployment Strategy: Subdomain on Netlify

Deploy the AI Audit tool as a separate Netlify site with a custom subdomain (e.g., `audit.yourdomain.com`) while keeping your main site on Netlify.

## 🎯 Deployment Strategy

Deploy the AI Audit tool as a **separate Netlify site** with a custom subdomain (e.g., `audit.yourdomain.com`) while keeping it connected to your main website ecosystem.

## 📋 Pre-Deployment Checklist

### 1. Repository Setup
- [ ] Push code to GitHub/GitLab repository
- [ ] Ensure all environment variables are documented
- [ ] Test local build: `npm run build`
- [ ] Verify health endpoint works: `npm run dev` → `http://localhost:3000/api/health`

### 2. Database Setup
- [ ] Set up production PostgreSQL database (Supabase, Railway, or Neon recommended)
- [ ] Note down the DATABASE_URL
- [ ] Test database connectivity

### 3. Environment Variables
- [ ] Prepare production environment variables (see list below)
- [ ] Generate secure NEXTAUTH_SECRET (32+ characters)
- [ ] Confirm n8n webhook URL

## 🚀 Step-by-Step Deployment

### Step 1: Create New Netlify Site

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"

2. **Connect Repository**
   - Choose your Git provider (GitHub/GitLab)
   - Select the AI Audit repository
   - Choose the `ai-audit-system` directory if it's in a subdirectory

3. **Configure Build Settings**
   ```
   Base directory: ai-audit-system (if in subdirectory)
   Build command: npm run build
   Publish directory: .next
   ```

### Step 2: Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
NEXTAUTH_URL=https://audit.yourdomain.com

# n8n Integration
N8N_WEBHOOK_URL=https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd

# Optional: Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Optional: Email
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
```

### Step 3: Configure Custom Domain

1. **In Netlify Dashboard**
   - Go to Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter: `audit.yourdomain.com`

2. **Update DNS Records**
   - Add CNAME record in your domain's DNS:
   ```
   Type: CNAME
   Name: audit
   Value: your-netlify-site-name.netlify.app
   ```

3. **Enable HTTPS**
   - Netlify will automatically provision SSL certificate
   - Wait for "HTTPS" status to show "Secured"

### Step 4: Deploy and Test

1. **Trigger Deployment**
   - Push changes to your repository
   - Or click "Trigger deploy" in Netlify dashboard

2. **Monitor Build**
   - Watch build logs for any errors
   - Build should complete in 2-5 minutes

3. **Test Deployment**
   - Visit `https://audit.yourdomain.com/api/health`
   - Should return healthy status
   - Test form submission
   - Verify PDF generation and storage

## 🔧 Database Migration

After successful deployment, run database migrations:

1. **Using Netlify CLI** (recommended):
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Link to your site
   netlify link
   
   # Run migration
   netlify env:import .env.production
   npx prisma migrate deploy
   ```

2. **Or manually in your local environment**:
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="your-production-database-url"
   
   # Run migrations
   npx prisma migrate deploy
   npx prisma generate
   ```

## 🔗 Integration with Main Website

### 1. Add Call-to-Action Button

Add this to your main website:

```html
<!-- Simple Button -->
<a href="https://audit.yourdomain.com" 
   class="audit-cta-button"
   target="_blank">
  Get Your Free AI Audit
</a>

<!-- Enhanced Button with Tracking -->
<a href="https://audit.yourdomain.com" 
   class="audit-cta-button"
   target="_blank"
   onclick="gtag('event', 'click', {
     event_category: 'AI Audit',
     event_label: 'CTA Button'
   });">
  <span>🤖</span>
  Get Your Free AI Audit Report
  <small>Takes 5 minutes • Instant Results</small>
</a>
```

### 2. Consistent Styling

Add CSS to match your main site:

```css
.audit-cta-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.audit-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}
```

### 3. Cross-Domain Analytics

If using Google Analytics, ensure both domains are tracked:

```javascript
// On main website
gtag('config', 'GA_MEASUREMENT_ID', {
  linker: {
    domains: ['yourdomain.com', 'audit.yourdomain.com']
  }
});
```

## 📊 Monitoring & Maintenance

### 1. Health Monitoring

Set up monitoring for:
- `https://audit.yourdomain.com/api/health`
- Form submission success rate
- PDF generation success rate
- Database connectivity

### 2. Netlify Functions Monitoring

Monitor in Netlify Dashboard:
- Function execution times
- Error rates
- Memory usage
- Invocation counts

### 3. Database Monitoring

Monitor your database for:
- Connection pool usage
- Query performance
- Storage usage
- Backup status

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs in Netlify dashboard
   - Verify all dependencies are in package.json
   - Ensure environment variables are set

2. **API Routes Don't Work**
   - Verify @netlify/plugin-nextjs is installed
   - Check netlify.toml configuration
   - Review function logs in Netlify dashboard

3. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if database allows connections from Netlify IPs
   - Test connection locally with same URL

4. **PDF Storage Issues**
   - Check file permissions
   - Verify upload directory exists
   - Monitor function timeout limits (10s default)

### Debug Endpoints:

- Health Check: `/api/health`
- PDF Debug: `/api/debug-pdf-storage`
- Test Endpoints: `/api/test-endpoints`

## 🎯 Go-Live Checklist

- [ ] Site deploys successfully
- [ ] Custom domain configured and SSL active
- [ ] Health check returns "healthy"
- [ ] Form submission works end-to-end
- [ ] PDF generation and storage working
- [ ] Email notifications working (if enabled)
- [ ] Analytics tracking configured
- [ ] Main website CTA button added
- [ ] Monitoring alerts configured
- [ ] Database backups scheduled

## 📞 Support Commands

```bash
# Check deployment status
netlify status

# View recent deployments
netlify deploy --build

# View function logs
netlify functions:log

# Test locally with Netlify environment
netlify dev
```

## 🎉 Success!

Once deployed, your AI Audit tool will be available at:
- **Main URL**: https://audit.yourdomain.com
- **Health Check**: https://audit.yourdomain.com/api/health
- **Admin Panel**: https://audit.yourdomain.com/api/pdf/retrieve?list=true

Your users can now access the AI Audit tool directly from your main website! 🚀
