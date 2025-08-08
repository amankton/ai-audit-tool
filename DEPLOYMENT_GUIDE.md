# AI Audit Tool - Deployment Guide

## 🎯 Recommended Approach: Subdomain Deployment

Deploy the AI Audit tool as a subdomain (e.g., `audit.yourdomain.com`) for better isolation, performance, and management.

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update production environment variables
- [ ] Configure production database
- [ ] Set up production n8n webhook URL
- [ ] Configure email settings
- [ ] Set up file storage (local or cloud)

### 2. Database Setup
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Run database migrations
- [ ] Test database connectivity
- [ ] Set up database backups

### 3. Security & Performance
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS settings
- [ ] Set up rate limiting
- [ ] Configure file upload limits
- [ ] Set up monitoring/logging

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### Advantages:
- ✅ Easy Next.js deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Easy subdomain configuration

#### Steps:
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd ai-audit-system
   vercel --prod
   ```

4. **Configure Custom Domain**
   - Go to Vercel Dashboard
   - Add custom domain: `audit.yourdomain.com`
   - Update DNS records as instructed

#### Environment Variables for Vercel:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://audit.yourdomain.com"
N8N_WEBHOOK_URL="https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd"
NEXT_PUBLIC_N8N_WEBHOOK_URL="https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd"
```

### Option 2: Netlify

#### Steps:
1. **Build the project**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy to Netlify**
   ```bash
   npm i -g netlify-cli
   netlify login
   netlify deploy --prod --dir=out
   ```

3. **Configure subdomain in Netlify DNS**

### Option 3: Traditional Hosting (cPanel/WHM)

#### Steps:
1. **Build for production**
   ```bash
   npm run build
   npm run start  # Test production build locally
   ```

2. **Create subdomain**
   - Create `audit` subdomain in hosting control panel
   - Point to a new directory (e.g., `/public_html/audit/`)

3. **Upload files**
   - Upload `.next`, `public`, `package.json`, etc.
   - Install dependencies on server
   - Configure process manager (PM2)

## 🔧 Production Configuration

### 1. Update Environment Variables

Create `.env.production`:
```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://audit.yourdomain.com"

# n8n Integration
N8N_WEBHOOK_URL="https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd"
NEXT_PUBLIC_N8N_WEBHOOK_URL="https://n8n.nfluencehub.com/webhook/f9c8b82d-996b-4860-b419-536c8718d6bd"

# Email Configuration (if using)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"

# File Storage
UPLOAD_DIR="/var/uploads/reports"  # Or cloud storage URL
MAX_FILE_SIZE="10485760"  # 10MB in bytes

# Security
CORS_ORIGIN="https://yourdomain.com,https://audit.yourdomain.com"
RATE_LIMIT_MAX="100"  # requests per window
RATE_LIMIT_WINDOW="900000"  # 15 minutes in ms
```

### 2. Database Migration Commands
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (if needed)
npx prisma db seed
```

### 3. Build Commands
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start production server
npm run start
```

## 🔗 Integration with Main Website

### 1. Add Link to Main Website
Add a prominent link/button on your main website:
```html
<a href="https://audit.yourdomain.com" target="_blank" class="audit-cta-button">
  Get Your Free AI Audit
</a>
```

### 2. Consistent Branding
- Use same color scheme/fonts
- Include your logo
- Maintain consistent messaging
- Add navigation back to main site

### 3. Analytics Integration
```javascript
// Google Analytics
gtag('config', 'GA_MEASUREMENT_ID', {
  custom_map: {'custom_parameter_1': 'audit_tool'}
});

// Track audit completions
gtag('event', 'audit_completed', {
  event_category: 'AI Audit',
  event_label: 'Form Submission'
});
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
- Set up uptime monitoring
- Database connection monitoring
- API endpoint health checks
- PDF generation monitoring

### 2. Backup Strategy
- Database backups (daily)
- File storage backups
- Configuration backups
- Code repository backups

### 3. Performance Monitoring
- Page load times
- API response times
- Database query performance
- File upload/download speeds

## 🚨 Troubleshooting

### Common Issues:
1. **Database Connection**: Check DATABASE_URL and network access
2. **File Uploads**: Verify upload directory permissions
3. **n8n Webhook**: Ensure webhook URL is accessible
4. **CORS Errors**: Configure CORS_ORIGIN properly
5. **SSL Issues**: Ensure HTTPS is properly configured

### Debug Endpoints:
- `GET /api/health` - System health check
- `GET /api/debug-pdf-storage` - PDF storage diagnostics
- `GET /api/test-endpoints` - API endpoint tests

## 📞 Support

After deployment, test these critical paths:
1. ✅ Form submission works
2. ✅ PDF generation and storage
3. ✅ Email delivery
4. ✅ PDF retrieval and download
5. ✅ Database connectivity
6. ✅ n8n webhook integration

## 🎯 Go-Live Checklist

- [ ] Domain/subdomain configured
- [ ] SSL certificate active
- [ ] Database migrations complete
- [ ] Environment variables set
- [ ] File permissions correct
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Performance tested
- [ ] Security tested
- [ ] User acceptance testing complete
