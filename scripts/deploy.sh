#!/bin/bash

# AI Audit Tool Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e  # Exit on any error

ENVIRONMENT=${1:-production}
echo "🚀 Deploying AI Audit Tool to $ENVIRONMENT..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the ai-audit-system directory"
    exit 1
fi

# Check if required files exist
if [ ! -f ".env.$ENVIRONMENT" ]; then
    print_warning ".env.$ENVIRONMENT not found. Using .env.production.example as template"
    if [ ! -f ".env.production.example" ]; then
        print_error "No environment configuration found!"
        exit 1
    fi
fi

print_status "Starting deployment process..."

# 1. Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# 2. Run database migrations
print_status "Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# 3. Build the application
print_status "Building application..."
npm run build

# 4. Run health checks
print_status "Running health checks..."
if command -v curl &> /dev/null; then
    # If we're deploying locally, test the health endpoint
    if [ "$ENVIRONMENT" = "development" ] || [ "$ENVIRONMENT" = "local" ]; then
        npm run start &
        SERVER_PID=$!
        sleep 5
        
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            print_status "Health check passed!"
        else
            print_error "Health check failed!"
            kill $SERVER_PID
            exit 1
        fi
        
        kill $SERVER_PID
    fi
fi

# 5. Deploy based on platform
case "$ENVIRONMENT" in
    "vercel")
        print_status "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            print_error "Vercel CLI not installed. Run: npm i -g vercel"
            exit 1
        fi
        ;;
    "netlify")
        print_status "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            print_status "Building for Netlify..."
            npm run build
            print_status "Deploying to production..."
            netlify deploy --prod
            print_status "Running post-deployment tasks..."
            netlify env:get DATABASE_URL > /dev/null && npx prisma migrate deploy
        else
            print_error "Netlify CLI not installed. Run: npm i -g netlify-cli"
            exit 1
        fi
        ;;
    "production")
        print_status "Production build complete!"
        print_warning "Manual deployment required. Upload the following:"
        echo "  - .next/ directory"
        echo "  - public/ directory"
        echo "  - package.json"
        echo "  - prisma/ directory"
        echo "  - .env.production file"
        ;;
    *)
        print_status "Build complete for $ENVIRONMENT environment"
        ;;
esac

print_status "Deployment process completed!"

# Print next steps
echo ""
echo "🎯 Next Steps:"
echo "1. Configure your subdomain (audit.yourdomain.com)"
echo "2. Set up SSL certificate"
echo "3. Update DNS records"
echo "4. Test the deployed application"
echo "5. Monitor health endpoint: /api/health"
echo ""
echo "📊 Useful URLs after deployment:"
echo "  - Health Check: https://audit.yourdomain.com/api/health"
echo "  - PDF List: https://audit.yourdomain.com/api/pdf/retrieve?list=true"
echo "  - Test Endpoints: https://audit.yourdomain.com/api/test-endpoints"
echo ""
print_status "Happy auditing! 🎉"
