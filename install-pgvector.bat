@echo off
echo ===================================
echo Installing pgvector Extension
echo ===================================
echo.

REM Use the full path to psql
set PSQL="C:\Program Files\PostgreSQL\16\bin\psql.exe"

REM Check if psql exists
if not exist %PSQL% (
    set PSQL="C:\Program Files\PostgreSQL\17\bin\psql.exe"
)

if not exist %PSQL% (
    echo ERROR: PostgreSQL not found!
    pause
    exit /b 1
)

echo Installing pgvector extension in database 'imagedb'...
echo You will be prompted for the postgres password.
echo.

%PSQL% -U postgres -d imagedb -c "CREATE EXTENSION IF NOT EXISTS vector;"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install pgvector!
    echo.
    echo The pgvector extension might not be installed in PostgreSQL.
    echo.
    echo To install pgvector:
    echo 1. Download from: https://github.com/pgvector/pgvector/releases
    echo 2. Or use Stack Builder (comes with PostgreSQL)
    echo 3. Or install via command line (requires admin)
    echo.
    pause
    exit /b 1
)

echo.
echo ===================================
echo pgvector installed successfully!
echo ===================================
echo.
echo Verifying installation...
%PSQL% -U postgres -d imagedb -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

echo.
echo SUCCESS! You can now start the backend.
echo Run: start-backend.bat
echo.
pause
