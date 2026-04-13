@echo off
REM Start Script for CinemaHub - Inicia Frontend + Backend (Windows)

echo.
echo 🎬 CinemaHub Startup Script
echo ================================
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ⚠️  No backend\.env found. Copying from template...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo 📝 Please update backend\.env with your API keys:
    echo    - OPENAI_API_KEY (get from https://platform.openai.com/api-keys^)
    echo    - EMAILJS credentials (get from https://dashboard.emailjs.com^)
    echo.
)

REM Check if frontend .env exists
if not exist ".env" (
    echo ⚠️  No .env found. Creating default...
    (
        echo VITE_SUPABASE_URL=https://hqxexgifvxfyjpkwxqsm.supabase.co
        echo VITE_SUPABASE_ANON_KEY=sb_publishable_aPL9opTU3BaSVRZS-rA9DQ_lKI4OQQg
        echo VITE_BACKEND_URL=http://localhost:3001
    ) > .env
)

REM Install dependencies if not present
echo 📦 Checking dependencies...

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Create batch files to run in separate windows
echo 🚀 Starting servers...
echo.

REM Create temp batch for frontend
echo @echo off > temp_frontend.bat
echo cd /d "%CD%" >> temp_frontend.bat
echo title Frontend - CinemaHub >> temp_frontend.bat
echo echo 🎬 Frontend running on http://localhost:5173 >> temp_frontend.bat
echo npm run dev >> temp_frontend.bat

REM Create temp batch for backend
echo @echo off > temp_backend.bat
echo cd /d "%CD%\backend" >> temp_backend.bat
echo title Backend - CinemaHub >> temp_backend.bat
echo echo 🤖 Backend running on http://localhost:3001 >> temp_backend.bat
echo npm run dev >> temp_backend.bat

REM Start both in separate windows
start "Frontend" cmd /k call temp_frontend.bat
timeout /t 2 /nobreak
start "Backend" cmd /k call temp_backend.bat

echo.
echo ✅ Both servers starting!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🤖 Backend:  http://localhost:3001
echo.
echo Close the terminal windows to stop the servers
echo.

pause
