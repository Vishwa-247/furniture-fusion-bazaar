@echo off
echo 🚀 Starting All StudyMate Backend Services...
echo =============================================

REM Get the directory of this script
set SCRIPT_DIR=%~dp0

echo.
echo 🔧 Starting services in sequence...
echo.

echo 📡 Starting Profile Service on port 8006...
start "Profile Service" /D "%SCRIPT_DIR%" start-profile-service.bat
timeout /t 3 /nobreak >nul

echo 📡 Starting Resume Analyzer on port 8003...
start "Resume Analyzer" /D "%SCRIPT_DIR%" start-resume-analyzer.bat
timeout /t 3 /nobreak >nul

echo 📡 Starting API Gateway on port 8000...
start "API Gateway" /D "%SCRIPT_DIR%" start-api-gateway.bat
timeout /t 3 /nobreak >nul

echo.
echo 🎉 All services started successfully!
echo.
echo Service URLs:
echo 📡 API Gateway: http://localhost:8000
echo 👤 Profile Service: http://localhost:8006
echo 📄 Resume Analyzer: http://localhost:8003
echo.
echo Health Checks:
echo curl http://localhost:8000/health
echo curl http://localhost:8006/health
echo curl http://localhost:8003/health
echo.
echo 📖 API Documentation:
echo http://localhost:8000/docs (API Gateway)
echo http://localhost:8006/docs (Profile Service)
echo http://localhost:8003/docs (Resume Analyzer)
echo.
echo To stop services, close each service window or use Task Manager
echo =============================================
pause