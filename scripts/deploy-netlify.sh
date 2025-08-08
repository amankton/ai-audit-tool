#!/bin/bash

# AI Audit Tool - Netlify Deployment Script
# Usage: ./scripts/deploy-netlify.sh

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 Deploying AI Audit Tool to Netlify..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the ai-audit-system directory"
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    print_warning "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

print_status "Pre-deployment checks..."

# 1. Install dependencies
print_status "Installing dependencies..."
npm ci

# 2. Run local build test
print_status "Testing local build..."
npm run build

# 3. Check if logged into Netlify
print_status "Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    print_warning "Not logged into Netlify. Please login:"
    netlify login
fi

# 4. Initialize Netlify site (if not already done)
if [ ! -f ".netlify/state.json" ]; then
    print_status "Initializing Netlify site..."
    netlify init
else
    print_status "Netlify site already initialized"
fi

# 5. Deploy to Netlify
print_status "Deploying to Netlify..."
netlify deploy --prod

print_status "Deployment completed!"

echo ""
echo "🎯 Next Steps:"
echo "1. Configure custom domain in Netlify Dashboard:"
echo "   - Go to: https://app.netlify.com/sites/[your-site]/settings/domain"
echo "   - Add custom domain: audit.yourdomain.com"
echo ""
echo "2. Set up environment variables in Netlify Dashboard:"
echo "   - DATABASE_URL"
echo "   - N8N_WEBHOOK_URL"
echo "   - NEXT_PUBLIC_N8N_WEBHOOK_URL"
echo "   - NEXTAUTH_SECRET"
echo ""
echo "3. Update DNS records with your domain provider:"
echo "   Type: CNAME"
echo "   Name: audit"
echo "   Value: [your-netlify-site].netlify.app"
echo ""
echo "4. Test your deployed site:"
echo "   - Health check: https://[your-site].netlify.app/api/health"
echo "   - Submit test audit"
echo ""
print_status "Happy auditing! 🎉"
