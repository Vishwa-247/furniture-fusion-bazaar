@echo off
echo 🚀 Starting All StudyMate Backend Services
echo ==========================================

cd /d "%~dp0\.."

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Please run: setup.bat
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

echo ✅ Starting services...
echo.

REM Start each service in a new window
start "API Gateway" cmd /k "cd /d %~dp0\.. && venv\Scripts\activate && cd api-gateway && python main.py"
timeout /t 2 /nobreak >nul

start "Profile Service" cmd /k "cd /d %~dp0\.. && venv\Scripts\activate && cd agents\profile-service && python main.py"
timeout /t 2 /nobreak >nul

start "Resume Analyzer" cmd /k "cd /d %~dp0\.. && venv\Scripts\activate && cd agents\resume-analyzer && python main.py"
timeout /t 2 /nobreak >nul

start "Course Generation" cmd /k "cd /d %~dp0\.. && venv\Scripts\activate && cd agents\course-generation && python main.py"
timeout /t 2 /nobreak >nul

start "Interview Coach" cmd /k "cd /d %~dp0\.. && venv\Scripts\activate && cd agents\interview-coach && python main.py"
timeout /t 2 /nobreak >nul

start "Emotion Detection" cmd /k "cd /d %~dp0\.. && venv\Scripts\activate && cd agents\emotion-detection && python main.py"
timeout /t 2 /nobreak >nul

echo.
echo ✅ All services started!
echo.
echo 📖 Service URLs:
echo    - API Gateway: http://localhost:8000
echo    - Profile Service: http://localhost:8006
echo    - Resume Analyzer: http://localhost:8003
echo    - Course Generation: http://localhost:8008
echo    - Interview Coach: http://localhost:8002
echo    - Emotion Detection: http://localhost:5000
echo.
echo 📖 API Documentation: http://localhost:8000/docs
echo.
pause
