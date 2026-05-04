#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

# Start agent.py with 'dev' arg in background
echo "Starting Agent..."
python3 ./venv/bin/python backend/ai/agent.py dev &

# Start server.py in background
echo "Starting AI Server..."
python3 ./venv/bin/python backend/ai/server.py &

# Start app.py with auto-restart using watchdog
echo "Starting Main App with Watchdog..."
python3 -m watchdog.watchmedo auto-restart --quiet --directory=./ --pattern="*.py" --recursive -- ./venv/bin/python backend/server/app.py &

# Start frontend (npm dev server)
echo "Starting Frontend (npm run dev)..."
cd frontend && npm run dev

# source venv/bin/activate