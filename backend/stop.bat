@echo off
echo 🛑 Stopping All StudyMate Backend Services
echo ==========================================

cd /d "%~dp0"

echo 🔍 Looking for backend service processes...
echo.

REM Stop by window title
echo 📡 Stopping services by window title...
taskkill /F /FI "WINDOWTITLE eq API Gateway*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Profile Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Resume Analyzer*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Course Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Course Generation*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Interview Coach*" 2>nul
taskkill /F /FI "WINDOWTITLE eq DSA Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Emotion Detection*" 2>nul

echo.
echo 🔨 Cleaning up processes on backend ports...

REM Clean up by port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8003') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8004') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8006') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8008') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /F /PID %%a 2>nul

echo.
echo ✅ All StudyMate backend services stopped!
echo.
echo 💡 To verify all processes are stopped:
echo    netstat -ano ^| findstr ":800"
echo    netstat -ano ^| findstr ":5000"
echo.
echo 🚀 To start services again, run: start.bat
echo ==========================================
pause
