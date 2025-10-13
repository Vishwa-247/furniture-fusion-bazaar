@echo off
echo 🛑 Stopping All StudyMate Backend Services...
echo ============================================

echo 🔍 Looking for StudyMate backend processes...

REM Stop Python processes related to StudyMate services
echo 📡 Stopping API Gateway...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq API Gateway*" 2>nul
taskkill /F /IM python.exe /FI "COMMANDLINE eq *api-gateway*main.py*" 2>nul

echo 📡 Stopping Profile Service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Profile Service*" 2>nul
taskkill /F /IM python.exe /FI "COMMANDLINE eq *profile-service*main.py*" 2>nul

echo 📡 Stopping Resume Analyzer...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Resume Analyzer*" 2>nul  
taskkill /F /IM python.exe /FI "COMMANDLINE eq *resume-analyzer*main.py*" 2>nul

echo 📡 Stopping DSA Service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq DSA Service*" 2>nul
taskkill /F /IM python.exe /FI "COMMANDLINE eq *dsa-service*main.py*" 2>nul

REM General cleanup for backend processes on common ports
echo 🔨 Cleaning up processes on backend ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8003') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8006') do taskkill /F /PID %%a 2>nul

echo.
echo 🎉 All StudyMate backend services stopped!
echo.
echo To verify all processes are stopped:
echo netstat -ano ^| findstr ":800"
echo.
echo To start services again:
echo scripts\start-all-services.bat
echo ============================================
pause