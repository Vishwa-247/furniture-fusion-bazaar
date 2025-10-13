@echo off
title Fix Groq Installation

echo 🔧 Fixing Groq Installation...
echo ================================

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Uninstalling current Groq version...
pip uninstall groq -y

echo Installing compatible Groq version...
pip install groq==0.11.0

echo Testing Groq installation...
python -c "from groq import Groq; print('✅ Groq imported successfully')"

if errorlevel 1 (
    echo ❌ Groq installation still has issues
    echo Trying alternative installation...
    pip install --no-cache-dir groq==0.11.0
    python -c "from groq import Groq; print('✅ Groq imported successfully')"
)

echo.
echo ✅ Groq fix completed!
echo.
echo Next steps:
echo 1. Restart your profile service
echo 2. Test with: python test_groq_connection.py
echo.

pause