# PowerShell script to deploy all Supabase functions
# Run this script from the root directory of your project

Write-Host "Starting Supabase function deployment..." -ForegroundColor Green

# Check if supabase CLI is available
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "supabase\functions")) {
    Write-Host "Error: supabase\functions directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Get all function directories
$functionDirs = Get-ChildItem -Directory "supabase\functions"

if ($functionDirs.Count -eq 0) {
    Write-Host "No functions found in supabase\functions directory." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($functionDirs.Count) function(s) to deploy:" -ForegroundColor Cyan
foreach ($dir in $functionDirs) {
    Write-Host "  - $($dir.Name)" -ForegroundColor Gray
}

Write-Host ""

# Deploy each function
$successCount = 0
$failCount = 0

foreach ($functionDir in $functionDirs) {
    $functionName = $functionDir.Name
    Write-Host "Deploying function: $functionName" -ForegroundColor Blue
    
    # Check if index.ts exists
    $indexPath = Join-Path $functionDir.FullName "index.ts"
    if (-not (Test-Path $indexPath)) {
        Write-Host "  Warning: $indexPath not found, skipping..." -ForegroundColor Yellow
        continue
    }
    
    try {
        # Build the function first
        Write-Host "  Building $functionName..." -ForegroundColor Gray
        $buildResult = supabase functions build $functionName 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Build failed for $functionName" -ForegroundColor Red
            Write-Host "  Error: $buildResult" -ForegroundColor Red
            $failCount++
            continue
        }
        
        # Deploy the function
        Write-Host "  Deploying $functionName..." -ForegroundColor Gray
        $deployResult = supabase functions deploy $functionName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Successfully deployed $functionName" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ Failed to deploy $functionName" -ForegroundColor Red
            Write-Host "  Error: $deployResult" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "  ✗ Exception occurred while deploying $functionName" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Successful: $successCount" -ForegroundColor Green
Write-Host "  ✗ Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "All functions deployed successfully! 🎉" -ForegroundColor Green
} else {
    Write-Host "Some functions failed to deploy. Please check the errors above." -ForegroundColor Yellow
}

# Additional instructions
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check your Supabase dashboard to verify the functions are available" -ForegroundColor Gray
Write-Host "2. Test the functions using the Supabase dashboard or your frontend" -ForegroundColor Gray
Write-Host "3. Make sure to set any required environment variables in your Supabase project" -ForegroundColor Gray

Write-Host ""
Write-Host "Environment variables you may need to set:" -ForegroundColor Yellow
Write-Host "  - RESEND_API_KEY (for send-quote-email function)" -ForegroundColor Gray
Write-Host "  - Any other API keys or configuration variables" -ForegroundColor Gray
