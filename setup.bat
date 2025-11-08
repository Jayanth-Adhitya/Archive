@echo off
echo ===================================
echo AI Image Archive - Setup Script
echo ===================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo √ .env file created
    echo.
    echo WARNING: Edit .env file and add your Gemini API key!
    echo    Get your API key from: https://aistudio.google.com/app/apikey
    echo.
    pause
) else (
    echo √ .env file already exists
)

echo.
echo Starting Docker containers...
echo.

REM Start docker compose
docker-compose up -d

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Services:
echo   Frontend:  http://localhost
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo Next steps:
echo   1. Visit http://localhost
echo   2. Create an account
echo   3. Start uploading images!
echo.
echo View logs:
echo   docker-compose logs -f
echo.
echo Stop services:
echo   docker-compose down
echo.
pause
