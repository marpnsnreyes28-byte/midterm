.\scripts\deploy-supabase.ps1<#
PowerShell helper to deploy the Supabase Edge Function `server` for the NDKC RFID project.

Usage:
  - Open PowerShell as the user who can run npm global installs (if needed)
  - From project root run: .\scripts\deploy-supabase.ps1

What it does:
  - Ensures supabase CLI is installed
  - Prompts you to login (interactive) if not logged in
  - Links the project to the project ref (default: foibpwuqcjtasarqwamx)
  - Optionally sets SUPABASE_SERVICE_ROLE_KEY as a project secret for functions
  - Deploys the `server` Edge Function
  - Verifies the health endpoint

Security note: do NOT paste your service role key into shared places. The script can read it from environment variable SUPABASE_SERVICE_ROLE_KEY or prompt for it securely.
#>

param(
  [string]$ProjectRef = 'foibpwuqcjtasarqwamx'
)

function Ensure-Command {
  param([string]$cmd)
  $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

Write-Host "== NDKC Supabase Auto-Deploy Helper =="

# Determine how to invoke supabase CLI
$SupabaseCmd = $null
if (Ensure-Command -cmd 'supabase') {
  $SupabaseCmd = 'supabase'
} elseif (Ensure-Command -cmd 'npx') {
  # prefer npx to avoid global installs
  $SupabaseCmd = 'npx supabase'
} else {
  Write-Warning "supabase CLI not found and 'npx' is not available.\nPlease install supabase CLI following: https://github.com/supabase/cli#install-the-cli"
  Write-Error "Cannot continue without supabase CLI. Install it or ensure 'npx' is available and re-run this script."
  exit 1
}

# Helper to invoke the chosen supabase command safely with an argument array
function Invoke-Supabase {
  param([string[]]$Args)
  $parts = $SupabaseCmd -split ' '
  $exe = $parts[0]
  $prefix = @()
  if ($parts.Length -gt 1) { $prefix = $parts[1..($parts.Length - 1)] }
  $fullArgs = @()
  if ($prefix) { $fullArgs += $prefix }
  if ($Args) { $fullArgs += $Args }
  Write-Host "Running: $exe $($fullArgs -join ' ')"
  & $exe @fullArgs
  return $LASTEXITCODE
}

# Check login status by attempting to run `supabase projects list` (non-destructive)
Write-Host "Checking supabase CLI auth status..."
try {
  # If SUPABASE_ACCESS_TOKEN is set, the CLI can use it; assume auth present
  if ($env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "SUPABASE_ACCESS_TOKEN detected in environment — skipping interactive login." -ForegroundColor Green
    $loggedIn = $true
  } else {
    $code = Invoke-Supabase -Args @('projects','list') > $null 2>&1
    $loggedIn = $code -eq 0
  }
} catch {
  $loggedIn = $false
}

if (-not $loggedIn) {
  Write-Host "You are not logged in to supabase CLI. A browser window will open for authentication." -ForegroundColor Cyan
  $code = Invoke-Supabase -Args @('login')
  if ($code -ne 0) {
    Write-Error "supabase login failed. You can alternatively create a Personal Access Token in the Supabase Dashboard and set SUPABASE_ACCESS_TOKEN environment variable to skip interactive login."
    Write-Error "Please run '$SupabaseCmd login' and try again, or set SUPABASE_ACCESS_TOKEN and re-run this script."
    exit 1
  }
}

# Link project ref
Write-Host "Linking project ref '$ProjectRef'..."
$code = Invoke-Supabase -Args @('link','--project-ref',$ProjectRef)
if ($code -ne 0) {
  Write-Error "Failed to link project. Confirm the project ref and try '$SupabaseCmd link --project-ref $ProjectRef' manually."
  exit 1
}

# Ensure service role key is available
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceRoleKey) {
  Write-Host "SUPABASE_SERVICE_ROLE_KEY not found in environment.\nYou can paste it now; input will be hidden." -ForegroundColor Yellow
  $secure = Read-Host -AsSecureString "Enter SUPABASE_SERVICE_ROLE_KEY (will not be echoed)"
  if ($secure -eq $null) {
    Write-Error "No service role key provided. Aborting."
    exit 1
  }
  $serviceRoleKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

# Set the secret in Supabase (Edge Functions runtime)
Write-Host "Setting SUPABASE_SERVICE_ROLE_KEY as a project secret (Edge Functions)..." -ForegroundColor Cyan
 $code = Invoke-Supabase -Args @('secrets','set',"SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey",'--project-ref',$ProjectRef)
 if ($code -ne 0) {
  Write-Warning "Failed to set project secret via CLI. You can also set this secret in the Supabase dashboard under Edge Functions → Environment variables."
  # continue - user may set secret later
 }

# Deploy the 'server' function
Write-Host "Deploying Edge Function 'server'..." -ForegroundColor Cyan
 $code = Invoke-Supabase -Args @('functions','deploy','server','--project-ref',$ProjectRef)
 if ($code -ne 0) {
  Write-Error "Function deployment failed. Check supabase CLI output above for errors."
  exit 1
 }

# Verify health endpoint
$projectId = "${ProjectRef}"
$healthUrl = "https://${projectId}.supabase.co/functions/v1/server/make-server-12535d4a/health"
Write-Host "Verifying health endpoint: $healthUrl"
try {
  $resp = curl -s -H "Authorization: Bearer $env:NEXT_PUBLIC_SUPABASE_ANON_KEY" $healthUrl | ConvertFrom-Json
  Write-Host "Health response:" -ForegroundColor Green
  $resp | Format-List
} catch {
  Write-Warning "Could not verify health endpoint automatically. Check the Supabase dashboard or try curling the URL manually: $healthUrl"
}

Write-Host "Deploy script finished. If deploy succeeded, retry the Add Teacher flow in the app." -ForegroundColor Green
