# SSH Key Debug Script for GitHub Actions
# Run this script to get the properly formatted SSH key for GitHub Secrets

param(
    [Parameter(Mandatory=$true)]
    [string]$KeyPath
)

Write-Host "🔧 SSH Key Debug Script" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Check if key file exists
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ Key file not found: $KeyPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Key file found: $KeyPath" -ForegroundColor Green

# Get key content
Write-Host "`n📋 Getting SSH key content..." -ForegroundColor Yellow
$keyContent = Get-Content $KeyPath -Raw

# Display first few characters
$preview = $keyContent.Substring(0, [Math]::Min(50, $keyContent.Length))
Write-Host "Key preview: $preview..." -ForegroundColor Gray

# Check key format
if ($keyContent.Contains("-----BEGIN RSA PRIVATE KEY-----")) {
    Write-Host "✅ RSA key format detected" -ForegroundColor Green
} elseif ($keyContent.Contains("-----BEGIN OPENSSH PRIVATE KEY-----")) {
    Write-Host "✅ OpenSSH key format detected" -ForegroundColor Green
} else {
    Write-Host "❌ Unknown key format" -ForegroundColor Red
}

# Check for common issues
Write-Host "`n🔍 Checking for common issues..." -ForegroundColor Yellow

if ($keyContent.Contains("`r`n")) {
    Write-Host "⚠️  Windows line endings detected" -ForegroundColor Yellow
}

if ($keyContent.StartsWith(" ") -or $keyContent.EndsWith(" ")) {
    Write-Host "⚠️  Leading/trailing spaces detected" -ForegroundColor Yellow
}

# Output the key content for GitHub Secrets
Write-Host "`n🔑 SSH Key Content for GitHub Secrets:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host $keyContent -ForegroundColor White

Write-Host "`n📋 Instructions:" -ForegroundColor Green
Write-Host "1. Copy the SSH key content above (including BEGIN/END lines)"
Write-Host "2. Go to GitHub Repository → Settings → Secrets and variables → Actions"
Write-Host "3. Update EC2_SSH_KEY secret with this exact content"
Write-Host "4. Make sure there are no extra spaces or characters"

# Test local SSH connection
Write-Host "`n🧪 Testing local SSH connection..." -ForegroundColor Yellow
$testResult = ssh -i $KeyPath -o ConnectTimeout=10 -o BatchMode=yes ec2-user@3.88.26.16 echo "SSH test successful" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Local SSH connection successful" -ForegroundColor Green
} else {
    Write-Host "❌ Local SSH connection failed" -ForegroundColor Red
    Write-Host "   Make sure your EC2 instance is running and security group allows SSH" -ForegroundColor Yellow
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update GitHub Secrets with the key content above"
Write-Host "2. Re-run the GitHub Actions workflow"
Write-Host "3. If still failing, try the alternative deployment workflow" 