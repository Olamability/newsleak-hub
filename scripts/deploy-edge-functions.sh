#!/bin/bash
# Deploy Supabase Edge Functions
# This script deploys the fetchFeeds edge function to Supabase

set -e  # Exit on error

echo "🚀 Deploying Supabase Edge Functions"
echo "======================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo ""
    echo "To install:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase"
    echo ""
    echo "To login:"
    echo "  supabase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Supabase"

# Get project reference from .env or prompt user
PROJECT_REF=""
if [ -f .env ]; then
    # Extract project ref from SUPABASE_URL
    PROJECT_REF=$(grep VITE_SUPABASE_URL .env | cut -d'=' -f2 | sed 's/https:\/\///' | cut -d'.' -f1)
fi

if [ -z "$PROJECT_REF" ]; then
    echo ""
    read -p "Enter your Supabase project reference ID: " PROJECT_REF
fi

echo "📦 Project: $PROJECT_REF"

# Link to project if not already linked
if ! supabase status &> /dev/null; then
    echo "🔗 Linking to Supabase project..."
    supabase link --project-ref "$PROJECT_REF"
    echo "✅ Linked to project"
else
    echo "✅ Already linked to project"
fi

# Deploy fetchFeeds function
echo ""
echo "📤 Deploying fetchFeeds function..."
supabase functions deploy fetchFeeds --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables for the function:"
echo "   - Go to: https://app.supabase.com/project/$PROJECT_REF/functions"
echo "   - Click on 'fetchFeeds'"
echo "   - Go to 'Settings' or 'Environment Variables'"
echo "   - Add:"
echo "     * SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "     * SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>"
echo ""
echo "2. Test the function:"
echo "   curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/fetchFeeds \\"
echo "     -H \"Authorization: Bearer <your-anon-key>\""
echo ""
echo "3. View logs:"
echo "   supabase functions logs fetchFeeds"
echo ""
