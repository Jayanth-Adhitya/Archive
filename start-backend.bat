@echo off
echo ===================================
echo Starting AI Image Archive Backend
echo ===================================
echo.

cd backend

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip first
echo Checking pip...
python -m pip install --upgrade pip --quiet

REM Check if dependencies are installed
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo.
    echo Installing dependencies...
    echo This may take 5-10 minutes on first run...
    echo.
    pip install -r requirements.txt
    echo.
    echo ✅ Dependencies installed!
    echo.
)

echo.
echo Starting backend server on http://localhost:8001
echo API Docs available at http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
