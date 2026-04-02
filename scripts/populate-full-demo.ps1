Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== ArchetypeOS Full Demo Population ===" -ForegroundColor Cyan

Write-Host "[1/3] Resetting seed users..." -ForegroundColor Yellow
npm run reset:test-users

Write-Host "[2/3] Seeding full lifecycle data..." -ForegroundColor Yellow
npm run seed

Write-Host "[3/3] Running smoke validation..." -ForegroundColor Yellow
./scripts/full-feature-smoke.ps1

Write-Host "=== Demo population complete ===" -ForegroundColor Green