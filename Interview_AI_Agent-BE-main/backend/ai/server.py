import asyncio, time
import os, jwt, sys 
from livekit import api
from livekit.agents import Agent
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from livekit.api import LiveKitAPI, ListRoomsRequest
from db_driver import get_interview_data, get_mock_interview_data, cleanup_agent_from_livekit
import uuid
import threading, requests, base64
import subprocess, datetime
from mongoengine import connect
from mongoengine import Document, StringField, ListField, DateTimeField, EmbeddedDocument, IntField, EmbeddedDocumentField

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/InterviewAI')
connect(db='InterviewAI', host=MONGO_URI)

class SkillSetting(EmbeddedDocument):
    skill = StringField(required=True)
    num_questions = IntField(default=0)

# Represents all skills of one admin
class AdminSkillSet(EmbeddedDocument):
    admin_id = StringField()  # Reference or ID of the admin
    skills = ListField(EmbeddedDocumentField(SkillSetting))  # Each admin has multiple skills

# Main Settings document
class Setting(Document):
    email = StringField()
    password = StringField()
    html = StringField()
    subject = StringField()
    openai_api_key = StringField()
    gemini_api_key = StringField()
    admin_skills = ListField(EmbeddedDocumentField(AdminSkillSet))  # Skills grouped per admin
    max_ques_limit = IntField()
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)
    master_key = StringField()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

running_agents = {}
running_agents_by_interview = {}
running_agents_by_agent_id = {}

async def generate_room_name():
    name = "room-" + str(uuid.uuid4())[:8]
    rooms = await get_rooms()
    while name in rooms:
        name = "room-" + str(uuid.uuid4())[:8]
    return name

async def get_rooms():
    api = LiveKitAPI()
    rooms = await api.room.list_rooms(ListRoomsRequest())
    await api.aclose()
    return [room.name for room in rooms.rooms]

def get_token_func(room):
    # print("Token room name-", room)
    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
        .with_identity(f"hv{room}")\
        .with_name(f"hv{room}")\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room
        ))
    
    return token.to_jwt()

@app.route("/getToken")
async def get_token():
    name = request.args.get("name", "my name")
    room = request.args.get("room", None)
    
    if not room:
        room = await generate_room_name()
    # print("Token room name-", room)
    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
        .with_identity(f"hv{room}")\
        .with_name(f"hv{room}")\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room
        ))
    
    return token.to_jwt()

def get_token_agent(room):
    # print("Token room name-", room)
    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
        .with_identity(f"hv{room}")\
        .with_name(f"hv{room}")\
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room,
            can_publish=True,
            can_subscribe=True,
            agent=True
        ))
    
    return token.to_jwt()


async def dispatch_job_to_agent(room_name):
    lkapi = api.LiveKitAPI()
    await lkapi.agent_dispatch.create_dispatch(
        api.CreateAgentDispatchRequest(
            agent_name=f"hv{room_name}",
            room=room_name
        )
    )


# def run_agent_thread(interview_id, room_name):
#     asyncio.run(run_agent(interview_id, room_name))

@app.route("/startAgent", methods=["POST"])
async def start_agent():
    try:
        # current_dir = os.path.dirname(os.path.abspath(__file__))
        data = request.get_json()
        interview_id = data.get("interviewId")
        interview_data = await get_interview_data(interview_id)

        # print(interview_data)
        room_name = interview_data.get("data").get("interview").get("room_id")
        agentVoice = interview_data.get("data").get("interview").get("agent_voice")
        history_length = len(interview_data.get("data").get("interview").get("history"))
        status = interview_data.get("data").get("interview").get("status")
        num_questions = interview_data.get("data").get("interview").get("num_questions") or 15
        if history_length >= num_questions or status == "completed":
            return jsonify({
                "message": "Interview already completed",
                "room": room_name,
                "interviewId": interview_id,
                "token": ""
            }), 400
        setting = Setting.objects.first()

        if not interview_id:
            return jsonify({"error": "interviewId is required"}), 400
        
        if not room_name:
            return jsonify({"error": "room is required"}), 400
        
                # Check if agent is already running for this interview

        agent_key = f"{interview_id}::{room_name}"
        if agent_key in running_agents:
            existing = running_agents[agent_key]
            process = existing.get("process")
            if process and process.poll() is None:
                print(f"Terminating existing agent for: {agent_key}")
                await cleanup_agent_from_livekit(room_name, existing.get("identity"))
                try:
                    process.terminate()
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                except Exception as e:
                    print(f"Error terminating process: {e}")
                del running_agents[agent_key]
        
                await asyncio.sleep(2)

        agent_token = get_token_agent(room_name)
        await dispatch_job_to_agent(room_name)

        # Start the agent in a separate process
        def run_agent(interview_id, room_name, agent_key, agentVoice):
            try:
                os.environ["INTERVIEW_ID"] = interview_id  # only if absolutely needed in subprocess
                os.environ["ROOM_NAME"] = room_name
                os.environ["INTERVIEW_ROLE"] = "real"
                # Create a completely clean environment - start from scratch
                env = {
                    # Essential system variables
                    "PATH": os.environ.get("PATH", ""),
                    "PYTHONPATH": os.environ.get("PYTHONPATH", ""),
                }
                
                # Add Windows-specific variables if needed
                if os.name == 'nt':
                    env.update({
                        "SystemRoot": os.environ.get("SystemRoot", ""),
                        "SystemDrive": os.environ.get("SystemDrive", ""),
                        "TEMP": os.environ.get("TEMP", ""),
                        "TMP": os.environ.get("TMP", ""),
                    })
                
                # Add API keys
                env.update({
    "LIVEKIT_API_KEY": str(os.environ.get("LIVEKIT_API_KEY") or ""),
    "LIVEKIT_API_SECRET": str(os.environ.get("LIVEKIT_API_SECRET") or ""),
    "LIVEKIT_URL": str(os.environ.get("LIVEKIT_URL") or ""),
    "GOOGLE_API_KEY": str(setting.gemini_api_key or ""), 
})

                
                # Set interview-specific variables - these should be unique per process
                env.update({
    "INTERVIEW_ID": str(interview_id),
    "ROOM_NAME": str(room_name),
    "AGENT_TOKEN_MEET": str(agent_token),
    "PROCESS_ID": str(f"{interview_id}_{int(time.time())}"),
    "AGENT_VOICE": str(agentVoice or "Puck"),
    "INTERVIEW_ROLE": "real"
})

                
                # print(f"DEBUG: Starting NEW agent process for Interview ID: {interview_id}, Room Name: {room_name}")
                # print(f"DEBUG: Environment INTERVIEW_ID: {env.get('INTERVIEW_ID')}")
                # print(f"DEBUG: Environment ROOM_NAME: {env.get('ROOM_NAME')}")
                # print(f"DEBUG: Process ID: {env.get('PROCESS_ID')}")
                
                # Run the agent script with virtual environment python
                # python_path = os.path.join(os.getcwd(), "venv", "Scripts", "python.exe")
                python_path = sys.executable
                current_dir = os.path.dirname(os.path.abspath(__file__))

                agent_path = os.path.join(current_dir, "agent.py")
                
                # Use a more explicit approach to ensure clean process start
                process = subprocess.Popen(
                    [python_path, agent_path, "dev"],
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1, 
                    cwd=current_dir,
                    # These parameters help ensure a clean process start
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0,
                    start_new_session=True if os.name != 'nt' else False,
                )

                # Store the process BEFORE starting to read output
                running_agents[agent_key] = {
                    "process": process,
                    "room": room_name,
                    "identity": f"hv{room_name}",
                    "interview_id": interview_id,
                    "start_time": time.time()
                }
                
                # print(f"Process started with PID: {process.pid} for interview: {interview_id}")
                
                # Live-stream logs from the subprocess
                for line in process.stdout:
                    print(f"[AGENT-{interview_id}] {line.strip()}")
                
                # Wait for process to complete
                return_code = process.wait()
                print(f"Agent process for {interview_id} completed with return code: {return_code}")
                
                # Clean up when process ends
                if agent_key in running_agents:
                    del running_agents[agent_key]
                    print(f"Cleaned up agent entry for: {agent_key}")
                    
            except Exception as e:
                print(f"Error running agent for {interview_id}: {e}")
                if agent_key in running_agents:
                    del running_agents[agent_key]
                raise
        
        # Start agent in a separate thread
        agent_thread = threading.Thread(target=run_agent, args=(interview_id, room_name, agent_key, agentVoice), name=f"Agent-{interview_id}")
        agent_thread.daemon = True
        agent_thread.start()
        
        return jsonify({
            "message": "Agent started successfully",
            "num_questions": num_questions,
            "room": room_name,
            "interviewId": interview_id,
            "token": get_token_func(room_name)
        }), 200
        
    except Exception as e:
        print(f"Error in start_agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/startMockAgent", methods=["POST"])
async def start_mock_agent():
    try:
        data = request.get_json()
        interview_id = data.get("interviewId")
        interview_data = await get_mock_interview_data(interview_id)
        room_name = interview_data.get("data").get("interview").get("room_id")
        agentVoice = interview_data.get("data").get("interview").get("agent_voice")
        status = interview_data.get("data").get("interview").get("status", "scheduled")
        history_length = len(interview_data.get("data").get("interview").get("history"))
        num_questions = interview_data.get("data").get("interview").get("num_questions") or 10
        if history_length >= num_questions or status == "completed":
            return jsonify({
                "message": "Interview already completed",
                "room": room_name,
                "interviewId": interview_id,
                "token": ""
            }), 400
        setting = Setting.objects.first()

        if not interview_id:
            return jsonify({"error": "interviewId is required"}), 400
        
        if not room_name:
            return jsonify({"error": "room is required"}), 400
        
                # Check if agent is already running for this interview

        agent_key = f"{interview_id}::{room_name}"
        if agent_key in running_agents:
            existing = running_agents[agent_key]
            process = existing.get("process")
            if process and process.poll() is None:
                print(f"Terminating existing agent for: {agent_key}")
                await cleanup_agent_from_livekit(room_name, existing.get("identity"))
                try:
                    process.terminate()
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                except Exception as e:
                    print(f"Error terminating process: {e}")
                del running_agents[agent_key]
        
                await asyncio.sleep(2)

        agent_token = get_token_agent(room_name)
        await dispatch_job_to_agent(room_name)

        # Start the agent in a separate process
        def run_agent(interview_id, room_name, agent_key, agentVoice):
            try:
                os.environ["INTERVIEW_ID"] = interview_id  # only if absolutely needed in subprocess
                os.environ["ROOM_NAME"] = room_name
                os.environ["INTERVIEW_ROLE"] = "mock"
                # Create a completely clean environment - start from scratch
                env = {
                    # Essential system variables
                    "PATH": os.environ.get("PATH", ""),
                    "PYTHONPATH": os.environ.get("PYTHONPATH", ""),
                }
                
                # Add Windows-specific variables if needed
                if os.name == 'nt':
                    env.update({
                        "SystemRoot": os.environ.get("SystemRoot", ""),
                        "SystemDrive": os.environ.get("SystemDrive", ""),
                        "TEMP": os.environ.get("TEMP", ""),
                        "TMP": os.environ.get("TMP", ""),
                    })
                
                # Add API keys
                # Updated API Keys block (Corrected)
                env.update({
                    "LIVEKIT_API_KEY": str(os.environ.get("LIVEKIT_API_KEY") or ""),
                    "LIVEKIT_API_SECRET": str(os.environ.get("LIVEKIT_API_SECRET") or ""),
                    "LIVEKIT_URL": str(os.environ.get("LIVEKIT_URL") or ""),
                    "GOOGLE_API_KEY": str(setting.gemini_api_key or ""),
                })

                
                # Set interview-specific variables - these should be unique per process
                env.update({
    "INTERVIEW_ID": str(interview_id),
    "ROOM_NAME": str(room_name),
    "AGENT_TOKEN_MEET": str(agent_token),
    "PROCESS_ID": str(f"{interview_id}_{int(time.time())}"),
    "AGENT_VOICE": str(agentVoice or "Puck"),
    "INTERVIEW_ROLE": "mock"
})

                
                # print(f"DEBUG: Starting NEW agent process for Interview ID: {interview_id}, Room Name: {room_name}")
                # print(f"DEBUG: Environment INTERVIEW_ID: {env.get('INTERVIEW_ID')}")
                # print(f"DEBUG: Environment ROOM_NAME: {env.get('ROOM_NAME')}")
                # print(f"DEBUG: Process ID: {env.get('PROCESS_ID')}")
                
                # Run the agent script with virtual environment python
                # python_path = os.path.join(os.getcwd(), "venv", "Scripts", "python.exe")
                python_path = sys.executable
                current_dir = os.path.dirname(os.path.abspath(__file__))

                agent_path = os.path.join(current_dir, "agent.py")
                
                # Use a more explicit approach to ensure clean process start

                process = subprocess.Popen(
                    [python_path, agent_path, "dev"],
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                    cwd=current_dir,
                    # These parameters help ensure a clean process start
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0,
                    start_new_session=True if os.name != 'nt' else False,
                )

                # Store the process BEFORE starting to read output
                running_agents[agent_key] = {
                    "process": process,
                    "room": room_name,
                    "identity": f"hv{room_name}",
                    "interview_id": interview_id,
                    "start_time": time.time()
                }
                
                # print(f"Process started with PID: {process.pid} for interview: {interview_id}")
                
                # Live-stream logs from the subprocess
                for line in process.stdout:
                    print(f"[AGENT-{interview_id}] {line.strip()}")
                
                # Wait for process to complete
                return_code = process.wait()
                print(f"Agent process for {interview_id} completed with return code: {return_code}")
                
                # Clean up when process ends
                if agent_key in running_agents:
                    del running_agents[agent_key]
                    print(f"Cleaned up agent entry for: {agent_key}")
                    
            except Exception as e:
                print(f"Error running agent for {interview_id}: {e}")
                if agent_key in running_agents:
                    del running_agents[agent_key]
                raise
        
        # Start agent in a separate thread
        agent_thread = threading.Thread(target=run_agent, args=(interview_id, room_name, agent_key, agentVoice), name=f"Agent-{interview_id}")
        agent_thread.daemon = True
        agent_thread.start()
        
        return jsonify({
            "message": "Agent started successfully",
            "room": room_name,
            "num_questions": num_questions,
            "interviewId": interview_id,
            "token": get_token_func(room_name)
        }), 200
        
    except Exception as e:
        print(f"Error in start_agent: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)