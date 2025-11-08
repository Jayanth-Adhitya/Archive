@echo off
echo ===================================
echo PostgreSQL Database Setup
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
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo Found PostgreSQL at: %PSQL%
echo.
echo This script will:
echo   1. Create database 'imagedb'
echo   2. Create user 'imageapp' with password 'changeme123'
echo   3. Install pgvector extension
echo.
echo You will be prompted for the postgres user password.
echo.
pause

echo.
echo Running setup commands...
echo.

%PSQL% -U postgres -c "DROP DATABASE IF EXISTS imagedb;"
%PSQL% -U postgres -c "DROP USER IF EXISTS imageapp;"
%PSQL% -U postgres -c "CREATE USER imageapp WITH PASSWORD 'changeme123';"
%PSQL% -U postgres -c "CREATE DATABASE imagedb;"
%PSQL% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE imagedb TO imageapp;"
%PSQL% -U postgres -d imagedb -c "CREATE EXTENSION vector;"
%PSQL% -U postgres -d imagedb -c "GRANT ALL ON SCHEMA public TO imageapp;"

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Database: imagedb
echo User: imageapp
echo Password: changeme123
echo.
echo Next steps:
echo 1. Update your .env file with the password 'changeme123'
echo 2. Run: start-backend.bat
echo.
echo Testing connection...
%PSQL% -U imageapp -d imagedb -c "SELECT version();"

if errorlevel 1 (
    echo.
    echo WARNING: Connection test failed!
    echo Please check the error above.
) else (
    echo.
    echo SUCCESS! Database is ready.
)

echo.
pause
