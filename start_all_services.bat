@echo off
echo ========================================
echo    StudyMate Backend Services Startup
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0backend"

echo 📁 Current directory: %CD%
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ⚠️  Virtual environment not found. Please run setup_backend.py first.
    echo    You can run: python setup_backend.py
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated
echo.

REM Start services in separate windows
echo 🚀 Starting all backend services...
echo.

REM API Gateway (Port 8000)
echo 📡 Starting API Gateway on port 8000...
start "API Gateway" cmd /k "cd /d %CD% && call venv\Scripts\activate && python api-gateway\main.py"
timeout /t 3 /nobreak >nul

REM Resume Analyzer (Port 8003)
echo 🧠 Starting Resume Analyzer on port 8003...
start "Resume Analyzer" cmd /k "cd /d %CD% && call venv\Scripts\activate && python agents\resume-analyzer\main.py"
timeout /t 3 /nobreak >nul

REM Profile Service (Port 8006)
echo 👤 Starting Profile Service on port 8006...
start "Profile Service" cmd /k "cd /d %CD% && call venv\Scripts\activate && python agents\profile-service\main.py"
timeout /t 3 /nobreak >nul

REM Course Service (Port 8007)
echo 🎓 Starting Course Service on port 8007...
start "Course Service" cmd /k "cd /d %CD% && call venv\Scripts\activate && python agents\course-service\simple_main.py"
timeout /t 3 /nobreak >nul

REM Interview Coach Service (Port 8002)
echo 🎤 Starting Interview Coach on port 8002...
start "Interview Coach" cmd /k "cd /d %CD% && call venv\Scripts\activate && python agents\interview-coach\main.py"
timeout /t 3 /nobreak >nul

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Checking service health...
echo.

REM Check API Gateway using PowerShell
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Output '✅ API Gateway (8000) - Running' } else { Write-Output '❌ API Gateway (8000) - Not responding' } } catch { Write-Output '❌ API Gateway (8000) - Not responding' }"

REM Check Resume Analyzer using PowerShell
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8003/health' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Output '✅ Resume Analyzer (8003) - Running' } else { Write-Output '❌ Resume Analyzer (8003) - Not responding' } } catch { Write-Output '❌ Resume Analyzer (8003) - Not responding' }"

REM Check Profile Service using PowerShell
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8006/health' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Output '✅ Profile Service (8006) - Running' } else { Write-Output '❌ Profile Service (8006) - Not responding' } } catch { Write-Output '❌ Profile Service (8006) - Not responding' }"

REM Check Course Service using PowerShell
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8007/health' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Output '✅ Course Service (8007) - Running' } else { Write-Output '❌ Course Service (8007) - Not responding' } } catch { Write-Output '❌ Course Service (8007) - Not responding' }"

REM Check Interview Coach using PowerShell
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8002/health' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Output '✅ Interview Coach (8002) - Running' } else { Write-Output '❌ Interview Coach (8002) - Not responding' } } catch { Write-Output '❌ Interview Coach (8002) - Not responding' }"

echo.
echo 🎉 All services startup attempted!
echo.
echo 📋 Service URLs:
echo    - API Gateway:      http://localhost:8000
echo    - Resume Analyzer:  http://localhost:8003
echo    - Profile Service:  http://localhost:8006
echo    - Course Service:   http://localhost:8007
echo    - Interview Coach:  http://localhost:8002
echo.
echo 🌐 Open your frontend at: http://localhost:5173
echo.
echo 📝 Note: Each service runs in its own window.
echo    Close this window to keep services running.
echo.
pause
