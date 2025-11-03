# Quick Start - User Testing
# Run this script to verify all services are ready

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SOMNIA AI AGENTS - SYSTEM CHECK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Backend
Write-Host "[1/3] Checking Backend Server..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:8000/" -Method GET -TimeoutSec 5
    Write-Host "  [OK] Backend running: $($backend.service)" -ForegroundColor Green
    Write-Host "  [OK] Agent DID: $($backend.agent_did)" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Backend not responding!" -ForegroundColor Red
    Write-Host "  Run: cd d:\strategi\agent; .\venv_new\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000" -ForegroundColor Yellow
    exit 1
}

# Check Agent Registration
Write-Host "`n[2/3] Checking Agent Registration..." -ForegroundColor Yellow
try {
    $agent = Invoke-RestMethod -Uri "http://localhost:8000/agent/info" -Method GET -TimeoutSec 5
    Write-Host "  [OK] Agent registered: $($agent.is_registered)" -ForegroundColor Green
    Write-Host "  [OK] Agent address: $($agent.address)" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Agent info not available!" -ForegroundColor Red
    exit 1
}

# Check Frontend
Write-Host "`n[3/3] Checking Frontend Server..." -ForegroundColor Yellow
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($frontendRunning) {
    Write-Host "  [OK] Frontend running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Frontend not running!" -ForegroundColor Yellow
    Write-Host "  Run: cd d:\strategi\frontend; npm run dev" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SYSTEM STATUS: READY FOR TESTING" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "  Health Check: http://localhost:8000/" -ForegroundColor White

Write-Host "`nContract Addresses (Somnia L1):" -ForegroundColor Cyan
Write-Host "  AccessNFT:      0x82a539fa3ea34287241c0448547Be65C6918a857" -ForegroundColor White
Write-Host "  AgentRegistry:  0x493179DB5063b98D7272f976a7173F199859656d" -ForegroundColor White
Write-Host "  Provenance:     0x3D4820d8F65Dc2E0b1013D6BEa6A19F2744e82e6" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "  2. Connect MetaMask wallet" -ForegroundColor White
Write-Host "  3. Follow USER_TESTING_GUIDE.md" -ForegroundColor White
Write-Host "  4. Test complete workflow" -ForegroundColor White

Write-Host "`n========================================`n" -ForegroundColor Cyan
