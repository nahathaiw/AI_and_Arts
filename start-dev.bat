@echo off
REM =============================================================================
REM "The Many Lives of One Face" - Development Server Launcher (Windows)
REM Starts both backend and frontend in parallel
REM =============================================================================

setlocal enabledelayedexpansion

title The Many Lives of One Face - Dev Server

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     The Many Lives of One Face - Development Server           ║
echo ║     Student: 楊妤安 (111006211)                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Change to project directory
cd /d "%~dp0"

REM Check if node_modules exist and install if needed
if not exist "frontend\node_modules" (
  echo 📦 Installing frontend dependencies...
  call npm install --prefix frontend
  if errorlevel 1 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
  )
)

if not exist "backend\node_modules" (
  echo 📦 Installing backend dependencies...
  call npm install --prefix backend
  if errorlevel 1 (
    echo ❌ Backend installation failed
    pause
    exit /b 1
  )
)

REM Check if .env file exists in backend
if not exist "backend\.env" (
  echo ⚠️  Warning: backend\.env not found!
  echo    Please create backend\.env with your GEMINI_API_KEY
  echo    Copy from backend\.env.example and add your API key
  echo.
  set /p continue="Continue anyway? (y/n): "
  if /i not "!continue!"=="y" (
    exit /b 1
  )
)

echo.
echo ✨ Starting servers...
echo.

REM Start both servers using npm run dev
call npm run dev

endlocal
pause
