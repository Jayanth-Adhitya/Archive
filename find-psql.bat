@echo off
echo Searching for PostgreSQL installation...
echo.

REM Common PostgreSQL installation paths
set PATHS[0]="C:\Program Files\PostgreSQL\16\bin\psql.exe"
set PATHS[1]="C:\Program Files\PostgreSQL\15\bin\psql.exe"
set PATHS[2]="C:\Program Files\PostgreSQL\14\bin\psql.exe"
set PATHS[3]="C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe"
set PATHS[4]="C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"

for /L %%i in (0,1,4) do (
    if exist !PATHS[%%i]! (
        echo Found: !PATHS[%%i]!
        echo.
        echo To use psql, run:
        echo !PATHS[%%i]! -U postgres
        echo.
        goto :found
    )
)

echo PostgreSQL not found in common locations.
echo.
echo Please check:
echo 1. Is PostgreSQL installed? Download from: https://www.postgresql.org/download/windows/
echo 2. Or locate psql.exe manually and use full path
echo.
echo Common locations:
echo   C:\Program Files\PostgreSQL\[version]\bin\psql.exe
echo   C:\Program Files (x86)\PostgreSQL\[version]\bin\psql.exe
echo.
pause
goto :eof

:found
echo.
echo Do you want to add PostgreSQL to PATH? (Y/N)
set /p ADD_PATH=
if /i "%ADD_PATH%"=="Y" (
    echo.
    echo Run this command as Administrator:
    echo setx PATH "%%PATH%%;C:\Program Files\PostgreSQL\16\bin" /M
    echo.
    echo Then restart Command Prompt
)
pause
