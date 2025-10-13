#!/usr/bin/env powershell
# StudyMate Backend Launcher (PowerShell)

Write-Host "🚀 StudyMate Backend Launcher" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Change to backend directory
Set-Location (Split-Path $MyInvocation.MyCommand.Path -Parent)

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please create virtual environment first:" -ForegroundColor Yellow
    Write-Host "python -m venv venv" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🔧 Activating virtual environment..." -ForegroundColor Blue
try {
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "✅ Virtual environment activated!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to activate virtual environment!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Installing/updating required packages..." -ForegroundColor Blue
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn groq asyncpg supabase python-dotenv PyPDF2 python-docx python-multipart pydantic

Write-Host "✅ Packages installed!" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Starting API Gateway on http://localhost:8000" -ForegroundColor Green
Write-Host "📖 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "❤️  Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Start the API Gateway
python -m uvicorn api-gateway.main:app --host 0.0.0.0 --port 8000 --reload

Read-Host "Press Enter to exit"
