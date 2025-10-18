@echo off
echo 🚀 Starting All StudyMate Backend Services
echo ==========================================

cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created.
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

echo ✅ Activating virtual environment...
call venv\Scripts\activate

echo 📦 Installing/updating dependencies...
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo.
echo ✅ Starting all services...
echo.

REM Start each service in a new window
start "API Gateway - Port 8000" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd api-gateway && python main.py"
timeout /t 2 /nobreak >nul

start "Profile Service - Port 8006" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\profile-service && python main.py"
timeout /t 2 /nobreak >nul

start "Resume Analyzer - Port 8003" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\resume-analyzer && python main.py"
timeout /t 2 /nobreak >nul

start "Course Service - Port 8001" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\course-service && python main.py"
timeout /t 2 /nobreak >nul

start "Course Generation - Port 8008" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\course-generation && python main.py"
timeout /t 2 /nobreak >nul

start "Interview Coach - Port 8002" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\interview-coach && python main.py"
timeout /t 2 /nobreak >nul

start "DSA Service - Port 8004" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\dsa-service && python main.py"
timeout /t 2 /nobreak >nul

start "Emotion Detection - Port 5000" cmd /k "cd /d %~dp0 && venv\Scripts\activate && cd agents\emotion-detection && python main.py"
timeout /t 2 /nobreak >nul

echo.
echo ✅ All services started successfully!
echo.
echo 📖 Service URLs:
echo    - API Gateway:         http://localhost:8000
echo    - Profile Service:     http://localhost:8006
echo    - Resume Analyzer:     http://localhost:8003
echo    - Course Service:      http://localhost:8001
echo    - Course Generation:   http://localhost:8008
echo    - Interview Coach:     http://localhost:8002
echo    - DSA Service:         http://localhost:8004
echo    - Emotion Detection:   http://localhost:5000
echo.
echo 📖 API Documentation: http://localhost:8000/docs
echo.
echo 🛑 To stop all services, run: stop.bat
echo ==========================================
pause
