# Hansraj Ventures - AI Interview Suite

A comprehensive AI-driven interview platform consisting of multiple specialized modules for Candidates, Admins, and SuperAdmins. This project uses React for frontends and Python (Flask) for the backend and AI agent orchestration.

##  Project Structure

- **AI_Interview-Admin-suman**: The Admin portal for managing interviews, candidates, and job targets.
- **AI_Interview-FE-timer-feat**: Candidate-side frontend with integrated interview timers and proctoring features.
- **Interview_AI_Agent-BE-main**: The core engine containing:
  - `backend/server`: Main API for data management (Port 5055).
  - `backend/ai`: AI Agent orchestration and LiveKit token generation (Port 5001).
  - `frontend`: The primary Interview Agent interface.
- **Interview_AI_Agent-SuperAdmin-main**: High-level dashboard for platform-wide settings and management.

---

##  Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **MongoDB** (Local or Atlas)
- **LiveKit** Cloud account (for voice/video)
- **Groq** AI API (for resume analysis)
- **Gemini** AI API (for livekit support)
- **Google Cloud condole setup** Gogle drive api configuration (for file upload/download)

---

##  Module-wise Setup

### 1. Main Backend (Core API)
Location: `Interview_AI_Agent-BE-main/backend/server`
```bash
# Setup
pip install -r ../../requirements.txt

# Run Development
python app.py

# Run Production (Windows)
waitress-serve --port=5055 app:app
```

### 2. AI Backend (Agent Orchestrator)
Location: `Interview_AI_Agent-BE-main/backend/ai`
```bash
# Run Development
python server.py

# Run Production (Windows)
waitress-serve --port=5001 server:app
```

### 3. Frontends (Admin, Candidate, SuperAdmin)
Applies to: `AI_Interview-Admin-suman`, `AI_Interview-FE-timer-feat`, `Interview_AI_Agent-SuperAdmin-main`, and `Interview_AI_Agent-BE-main/frontend`

```bash
# Install dependencies
npm install

# Run Development (Default Port: 5173)
npm run dev

# Build for Production
npm run build
```

---

##  Environment Variables

Each module requires a `.env` file. Ensure you configure these before running:

**Backend Requirements:**
- `MONGO_URI`: Your MongoDB connection string.
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`: For AI agent communication.
- `GOOGLE_API_KEY`: For Gemini AI features.
- `JWT_SECRET_KEY`: For authentication.
- `GROQ_AI_KEY`: For Resume analysis.
- `GOOGLE_DRIVE_SETUP`: For Resume analysis.

**Frontend Requirements:**
- `VITE_API_BASE_URL`: Point this to your backend (usually `http://localhost:5055/api`).
- `VITE_MAIL_URL`: Point this to your interview link base (usually `http://localhost:5995`).

---

##  Deployment Tips

1. **Frontend**: Always run `npm run build` and serve the resulting `dist` folder using Nginx or a static host.
2. **Backend**: Use `waitress-serve` (Windows) or `gunicorn` (Linux) for production. Do not use `app.run(debug=True)`.
3. **HTTPS**: LiveKit and browser microphone access **require** HTTPS in production.
