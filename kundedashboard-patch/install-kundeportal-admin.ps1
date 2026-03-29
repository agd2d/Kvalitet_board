# install-kundeportal-admin.ps1
# Kør dette script i PowerShell for at installere Kundeportal-admin i Kundedashboard

$ErrorActionPreference = "Stop"
$base = "https://raw.githubusercontent.com/agd2d/Kvalitet_board/main/kundedashboard-patch"
$repo = "https://github.com/agd2d/Kundedashboard.git"
$dest = Join-Path $env:USERPROFILE "Hvidbjerg Service\Kundedashboard"

Write-Host "Kloner eller opdaterer Kundedashboard..." -ForegroundColor Cyan
if (Test-Path $dest) {
    Set-Location $dest
    git pull origin main
} else {
    git clone $repo $dest
    Set-Location $dest
}

git checkout -b claude/kundeportal-admin 2>$null
if ($LASTEXITCODE -ne 0) { git checkout claude/kundeportal-admin }

$files = @(
    "app/(dashboard)/kundeportal/page.tsx",
    "app/(dashboard)/kundeportal/bookinger/page.tsx",
    "app/(dashboard)/kundeportal/bookinger/BookingAdminList.tsx",
    "app/(dashboard)/kundeportal/opgaver/page.tsx",
    "app/(dashboard)/kundeportal/opgaver/TaskAdminList.tsx",
    "app/(dashboard)/kundeportal/beskeder/page.tsx",
    "app/(dashboard)/kundeportal/beskeder/AdminChatWindow.tsx",
    "app/(dashboard)/layout.tsx",
    "app/api/portal/tasks/route.ts",
    "app/api/portal/tasks/employees/route.ts",
    "app/api/portal/messages/route.ts",
    "lib/supabase/portal.ts",
    "components/MobileNav.tsx"
)

foreach ($file in $files) {
    $url = "$base/$file"
    $target = Join-Path $dest $file
    $dir = Split-Path $target -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "Henter $file..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing
}

Write-Host "Committer og pusher..." -ForegroundColor Cyan
git add -A
git commit -m "Tilfoej Kundeportal admin-sektion"
git push -u origin claude/kundeportal-admin

Write-Host ""
Write-Host "DONE! Koden er pushet til GitHub." -ForegroundColor Green
Write-Host "Gaa til Vercel og deployer branchen 'claude/kundeportal-admin'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Husk at tilfoeje disse miljoevariabler i Vercel:" -ForegroundColor Yellow
Write-Host "  PORTAL_SUPABASE_URL = https://qhalkbpubpbojxxsxlnh.supabase.co"
Write-Host "  PORTAL_SUPABASE_SERVICE_ROLE_KEY = (hent fra Supabase Settings > API Keys > service_role)"
