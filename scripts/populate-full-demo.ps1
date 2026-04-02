Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== ArchetypeOS Full Demo Population ===" -ForegroundColor Cyan

Write-Host "[1/2] Resetting seed users..." -ForegroundColor Yellow
npm run reset:test-users

Write-Host "[2/2] Running smoke validation..." -ForegroundColor Yellow
./scripts/full-feature-smoke.ps1

Write-Host "=== Demo population complete ===" -ForegroundColor Green