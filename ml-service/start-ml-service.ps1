# ML Service Startup Script (PowerShell)
# Purpose: Start the ML service with the correct Python venv
# Usage: .\start-ml-service.ps1

param(
    [int]$Port = 8000,
    [switch]$NoReload,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
ML Service Startup Script
========================

Usage:
  .\start-ml-service.ps1 [OPTIONS]

Options:
  -Port <number>      : Port to run on (default: 8000)
  -NoReload          : Disable auto-reload on file changes
  -Help              : Show this help message

Examples:
  .\start-ml-service.ps1                    # Start on port 8000 with reload
  .\start-ml-service.ps1 -Port 9000         # Start on port 9000
  .\start-ml-service.ps1 -NoReload          # Start without auto-reload
"@
    exit 0
}

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonExe = Join-Path $scriptDir "venv\Scripts\python.exe"
$reloadFlag = if ($NoReload) { "" } else { "--reload" }

Write-Host "🚀 Starting ML Service..." -ForegroundColor Green
Write-Host "Port: $Port" -ForegroundColor Cyan
Write-Host "Auto-reload: $(if ($NoReload) { 'Disabled' } else { 'Enabled' })" -ForegroundColor Cyan
Write-Host ""

# Verify Python executable exists
if (-not (Test-Path $pythonExe)) {
    Write-Host "❌ Error: Python executable not found at: $pythonExe" -ForegroundColor Red
    Write-Host "Please ensure the ml-service venv is properly set up." -ForegroundColor Yellow
    exit 1
}

# Verify main.py exists
$mainPy = Join-Path $scriptDir "main.py"
if (-not (Test-Path $mainPy)) {
    Write-Host "❌ Error: main.py not found at: $mainPy" -ForegroundColor Red
    exit 1
}

# Start the service
Write-Host "Starting uvicorn server on http://127.0.0.1:$Port" -ForegroundColor Cyan
Write-Host "📖 Docs available at: http://127.0.0.1:$Port/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

& $pythonExe -m uvicorn main:app $reloadFlag --port $Port --host 127.0.0.1
