@echo off
title StudyMate Backend Quick Start

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                     StudyMate Backend Setup                     ║
echo ║               Resume Upload + Profile Auto-Fill                 ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 🚀 Setting up StudyMate Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Run the setup script
echo 📦 Running automated setup...
python setup_backend.py

if errorlevel 1 (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.

REM Ask user what to do next
echo What would you like to do?
echo.
echo 1. Start all services (recommended)
echo 2. Start only Profile Service (for resume upload)
echo 3. Configure environment variables first
echo 4. Run tests
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting all services...
    scripts\start_all_services.bat
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Starting Profile Service...
    scripts\start_profile_service.bat
) else if "%choice%"=="3" (
    echo.
    echo 📝 Please edit the .env file with your API keys:
    echo - Get Groq API key from: https://groq.com/
    echo - Get Supabase credentials from your project dashboard
    echo.
    echo Opening .env file...
    notepad .env
    echo.
    echo After editing, you can run: scripts\start_all_services.bat
) else if "%choice%"=="4" (
    echo.
    echo 🧪 Running tests...
    venv\Scripts\python.exe test_complete_workflow.py
) else (
    echo.
    echo 👋 Goodbye! You can start services later using:
    echo scripts\start_all_services.bat
)

echo.
echo 📚 Documentation available at:
echo - API Gateway: http://localhost:8000/docs
echo - Profile Service: http://localhost:8006/docs
echo - Resume Analyzer: http://localhost:8003/docs
echo.

pause