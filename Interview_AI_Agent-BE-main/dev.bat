@REM @echo off
@REM .\venv\Scripts\python.exe -m watchdog.watchmedo auto-restart  --quiet --directory=./ --pattern="*.py" --recursive -- .\venv\Scripts\python.exe backend\server\app.py



@echo off
cd /d %~dp0

:: Start agent.py (with dev arg) in new window
@REM start "Agent" cmd /k ".\venv\Scripts\python.exe backend\ai\agent.py dev"

:: Start server.py
start "AI Server" cmd /k ".\venv\Scripts\python.exe backend\ai\server.py"

:: Start app.py with auto-restart using watchdog
start "Main App" cmd /k ".\venv\Scripts\python.exe -m watchdog.watchmedo auto-restart --quiet --directory=./ --pattern=*.py --recursive -- .\venv\Scripts\python.exe backend\server\app.py"

:: Start frontend using npm
start "Frontend" cmd /k "cd frontend && npm run dev"
