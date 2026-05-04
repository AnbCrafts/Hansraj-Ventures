# AI Interview Agent Platform

This project is an AI-powered interview platform that allows you to conduct real-time interviews using OpenAI, and LiveKit voice/video infrastructure.

---

# 📁 Project Structure
```bash
C:.
│ dev.bat <- Launches all services
│ requirements.txt <- Python dependencies
│
├── backend/
│ ├── ai/ <- AI Agent logic (LiveKit + OpenAI tools)
│ └── server/ <- Flask API backend with MongoDB models & routes
│
└── frontend/ <- Frontend app using Vite + React 
```


---

## ✅ Prerequisites

Before running the project, make sure you have the following installed:

- **Python 3.12+**
- **Node.js v18+**
- **MongoDB** (local or Atlas)
- **Git**
- [LiveKit Cloud](https://livekit.io/cloud) account & credentials 

---

## ⚙️ Installation Steps

> 🪄 Everything runs through `dev.bat` once setup is done.

### 1. Clone the Project

```bash
git clone https://github.com/Aditya-123-me/Interview_AI_Agent-BE.git
cd project-folder
```

### 2. Create a Virtual Environment (Windows)
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 5. Add .env file into the root of the folder

### 6. Running the Project 
```bash
./dev.bat
```
This will:

Start the Flask backend (backend/server/app.py)

Start the AI Interview Agent logic (backend/ai/server.py)
Launch frontend

http://localhost:5173/








## Agent Voices 
"ash": {"gender": "male", "description": "Warm, friendly male voice"},
"ballad": {"gender": "female", "description": "Smooth, melodic female voice"},
"coral": {"gender": "female", "description": "Bright, energetic female voice"},
"sage": {"gender": "neutral", "description": "Calm, wise voice"},
"verse": {"gender": "neutral", "description": "Poetic, expressive voice"},








# Ignore this (For Developers)
python .\backend\ai\agent.py dev

npm run dev

python backend\ai\server.py

source venv/bin/activate

python backend/server/app.py

.\dev.bat

tree /F /A > structure.txt

 docker-compose logs -f backend-app
docker-compose up -d --build

FE - 685b5173fc6e3bae642241c2
BE - 