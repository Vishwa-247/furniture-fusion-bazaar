@echo off
title StudyMate Backend - Simple Setup

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                     StudyMate Backend Setup                     ║
echo ║                         Simple Version                          ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 🔧 Setting up StudyMate Backend (Simple Method)...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

echo.
echo 📥 Activating virtual environment and installing dependencies...

REM Activate venv and install packages
call venv\Scripts\activate.bat

echo 🔄 Upgrading pip...
python -m pip install --upgrade pip

echo 📦 Installing core packages...
python -m pip install fastapi uvicorn pydantic python-multipart

echo 🤖 Installing AI packages...
python -m pip install groq google-generativeai

echo 📄 Installing file processing packages...
python -m pip install PyPDF2 python-docx

echo 🗄️ Installing database packages...
python -m pip install asyncpg supabase motor pymongo

echo 🔐 Installing security packages...
python -m pip install python-jose[cryptography] passlib[bcrypt]

echo 🌐 Installing HTTP packages...
python -m pip install httpx requests python-dotenv

echo 🛠️ Installing utilities...
python -m pip install aiofiles python-dateutil redis

if errorlevel 1 (
    echo ❌ Some packages failed to install
    echo ⚠️ You can continue - not all packages are required for basic functionality
)

echo.
echo ✅ Basic setup completed!

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env configuration file...
    echo # StudyMate Backend Environment Configuration > .env
    echo # ============================================== >> .env
    echo. >> .env
    echo # Groq AI Configuration (Required for Resume Parsing) >> .env
    echo GROQ_API_KEY=your_groq_api_key_here >> .env
    echo. >> .env
    echo # Supabase Configuration (Required for Database) >> .env
    echo SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co >> .env
    echo SUPABASE_SERVICE_KEY=your_supabase_service_key_here >> .env
    echo SUPABASE_DB_URL=postgresql://postgres:your_password@db.jwmsgrodliegekbrhvgt.supabase.co:5432/postgres >> .env
    echo. >> .env
    echo # JWT Configuration >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> .env
    echo.
    echo ✅ Environment file created
)

REM Create simple service runner scripts
if not exist "scripts" mkdir scripts

echo @echo off > scripts\start_profile_service.bat
echo title Profile Service >> scripts\start_profile_service.bat
echo echo 🚀 Starting Profile Service on port 8006... >> scripts\start_profile_service.bat
echo cd /d "%~dp0\.." >> scripts\start_profile_service.bat
echo call venv\Scripts\activate.bat >> scripts\start_profile_service.bat
echo python agents\profile-service\main.py >> scripts\start_profile_service.bat
echo pause >> scripts\start_profile_service.bat

echo @echo off > scripts\start_resume_analyzer.bat
echo title Resume Analyzer >> scripts\start_resume_analyzer.bat
echo echo 🚀 Starting Resume Analyzer on port 8003... >> scripts\start_resume_analyzer.bat
echo cd /d "%~dp0\.." >> scripts\start_resume_analyzer.bat
echo call venv\Scripts\activate.bat >> scripts\start_resume_analyzer.bat
echo python agents\resume-analyzer\main.py >> scripts\start_resume_analyzer.bat
echo pause >> scripts\start_resume_analyzer.bat

echo @echo off > scripts\start_api_gateway.bat
echo title API Gateway >> scripts\start_api_gateway.bat
echo echo 🚀 Starting API Gateway on port 8000... >> scripts\start_api_gateway.bat
echo cd /d "%~dp0\.." >> scripts\start_api_gateway.bat
echo call venv\Scripts\activate.bat >> scripts\start_api_gateway.bat
echo python api-gateway\main.py >> scripts\start_api_gateway.bat
echo pause >> scripts\start_api_gateway.bat

echo @echo off > scripts\start_all_services.bat
echo title All Services >> scripts\start_all_services.bat
echo echo 🚀 Starting All StudyMate Services... >> scripts\start_all_services.bat
echo echo ===================================== >> scripts\start_all_services.bat
echo. >> scripts\start_all_services.bat
echo echo Starting Profile Service... >> scripts\start_all_services.bat
echo start "Profile Service" "%~dp0start_profile_service.bat" >> scripts\start_all_services.bat
echo timeout /t 3 /nobreak ^>nul >> scripts\start_all_services.bat
echo. >> scripts\start_all_services.bat
echo echo Starting Resume Analyzer... >> scripts\start_all_services.bat
echo start "Resume Analyzer" "%~dp0start_resume_analyzer.bat" >> scripts\start_all_services.bat
echo timeout /t 3 /nobreak ^>nul >> scripts\start_all_services.bat
echo. >> scripts\start_all_services.bat
echo echo Starting API Gateway... >> scripts\start_all_services.bat
echo start "API Gateway" "%~dp0start_api_gateway.bat" >> scripts\start_all_services.bat
echo. >> scripts\start_all_services.bat
echo echo ✅ All services started! >> scripts\start_all_services.bat
echo echo. >> scripts\start_all_services.bat
echo echo Service URLs: >> scripts\start_all_services.bat
echo echo - API Gateway: http://localhost:8000 >> scripts\start_all_services.bat
echo echo - Profile Service: http://localhost:8006   >> scripts\start_all_services.bat
echo echo - Resume Analyzer: http://localhost:8003 >> scripts\start_all_services.bat
echo pause >> scripts\start_all_services.bat

echo.
echo ✅ Service runner scripts created in scripts\ folder
echo.

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                        Setup Complete!                          ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Next Steps:
echo.
echo 1. 🔑 Edit .env file with your API keys:
echo    - Get Groq API key from: https://groq.com/
echo    - Get Supabase credentials from your project dashboard
echo.
echo 2. 🚀 Start services:
echo    - All services: scripts\start_all_services.bat
echo    - Profile only: scripts\start_profile_service.bat
echo.
echo 3. 🧪 Test resume upload:
echo    - Visit: http://localhost:8006/docs
echo    - Upload a resume to /extract-profile endpoint
echo.
echo 4. 📖 API Documentation:
echo    - API Gateway: http://localhost:8000/docs
echo    - Profile Service: http://localhost:8006/docs
echo    - Resume Analyzer: http://localhost:8003/docs
echo.

set /p choice="Would you like to start all services now? (y/N): "
if /i "%choice%"=="y" (
    echo.
    echo 🚀 Starting all services...
    scripts\start_all_services.bat
) else (
    echo.
    echo 👋 You can start services later using: scripts\start_all_services.bat
)

echo.
pause