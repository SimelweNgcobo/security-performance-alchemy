#!/bin/bash

# Bash script to deploy all Supabase functions
# Run this script from the root directory of your project

echo "🚀 Starting Supabase function deployment..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "supabase/functions" ]; then
    echo "❌ Error: supabase/functions directory not found. Please run this script from the project root."
    exit 1
fi

# Get all function directories
function_dirs=(supabase/functions/*/)

if [ ${#function_dirs[@]} -eq 0 ]; then
    echo "⚠️  No functions found in supabase/functions directory."
    exit 0
fi

echo "📁 Found ${#function_dirs[@]} function(s) to deploy:"
for dir in "${function_dirs[@]}"; do
    function_name=$(basename "$dir")
    echo "   - $function_name"
done

echo ""

# Deploy each function
success_count=0
fail_count=0

for dir in "${function_dirs[@]}"; do
    function_name=$(basename "$dir")
    echo "🔨 Deploying function: $function_name"
    
    # Check if index.ts exists
    if [ ! -f "$dir/index.ts" ]; then
        echo "   ⚠️  Warning: $dir/index.ts not found, skipping..."
        continue
    fi
    
    # Build the function first
    echo "   🏗️  Building $function_name..."
    if supabase functions build "$function_name" &> /dev/null; then
        echo "   ✅ Build successful"
    else
        echo "   ❌ Build failed for $function_name"
        ((fail_count++))
        continue
    fi
    
    # Deploy the function
    echo "   🚀 Deploying $function_name..."
    if supabase functions deploy "$function_name" &> /dev/null; then
        echo "   ✅ Successfully deployed $function_name"
        ((success_count++))
    else
        echo "   ❌ Failed to deploy $function_name"
        ((fail_count++))
    fi
    
    echo ""
done

# Summary
echo "📊 Deployment Summary:"
echo "   ✅ Successful: $success_count"
echo "   ❌ Failed: $fail_count"

if [ $fail_count -eq 0 ]; then
    echo "🎉 All functions deployed successfully!"
else
    echo "⚠️  Some functions failed to deploy. Please check the errors above."
fi

# Additional instructions
echo ""
echo "📋 Next steps:"
echo "1. Check your Supabase dashboard to verify the functions are available"
echo "2. Test the functions using the Supabase dashboard or your frontend"
echo "3. Make sure to set any required environment variables in your Supabase project"

echo ""
echo "🔑 Environment variables you may need to set:"
echo "   - RESEND_API_KEY (for send-quote-email function)"
echo "   - Any other API keys or configuration variables"

echo ""
echo "✨ Deployment process completed!"
