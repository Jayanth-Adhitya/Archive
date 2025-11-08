@echo off
echo Testing backend endpoints...
echo.

echo 1. Testing root endpoint:
curl -s http://localhost:8000/ | python -m json.tool
echo.
echo.

echo 2. Testing health endpoint:
curl -s http://localhost:8000/health | python -m json.tool
echo.
echo.

echo 3. Testing API docs:
echo Visit: http://localhost:8000/docs
echo.
echo.

echo 4. Testing auth register endpoint:
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo If you see HTML or 404, the route might not be registered properly.
echo If you see JSON with user data, it works!
echo.
pause
