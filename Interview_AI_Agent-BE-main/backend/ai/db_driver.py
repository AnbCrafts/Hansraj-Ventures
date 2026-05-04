import datetime
import os, aiohttp
from dotenv import load_dotenv
from flask import request
from livekit import api

load_dotenv()

BASEURL = f"{os.getenv('DOMAIN_URL')}/api/interview/agent"
MOCKBASEURL = f"{os.getenv('DOMAIN_URL')}/api/mockInterview/agent"

async def get_interview_data(interview_id: str):
    try:
        url = f"{BASEURL}/getInterviewData/{interview_id}"
        headers = { 
            "Authorization": f"Bearer {os.getenv('AGENT_TOKEN')}"
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                resp.raise_for_status()
                return await resp.json()
    except Exception as e:
        print(f"[ERROR] Failed to fetch interview data: {e}")
        return None

async def get_mock_interview_data(interview_id: str):
    try:
        url = f"{MOCKBASEURL}/getMockInterviewData/{interview_id}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AGENT_TOKEN')}"
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                resp.raise_for_status()
                return await resp.json()
    except Exception as e:
        print(f"[ERROR] Failed to fetch interview data: {e}")
        return None

async def update_chat_history(interview_id: str, user_input: str, agent_reply: str, score: int, role: str, question_id: str) -> bool:
    try:
        if role == "mock": url = f"{MOCKBASEURL}/chatUpdateMock"
        else: url = f"{BASEURL}/chatUpdate"
        headers = {
            "Authorization": f"Bearer {os.getenv('AGENT_TOKEN')}",
            "Content-Type": "application/json"
        }
        payload = {
            "interview_id": interview_id,
            "user": user_input,
            "agent": agent_reply,
            "score": score,
            "question_id": question_id
        }
        async with aiohttp.ClientSession() as session:
            async with session.put(url, json=payload, headers=headers) as resp:
                resp.raise_for_status()
                data = await resp.json()
                return data.get("data", {}).get("duplicate", False)
    except Exception as e:
        print(f"[update_chat_history] Failed to update chat: {str(e)}")
        return False
    
async def get_history_data(interview_id: str, role: str) -> bool:
    try:
        if role == "mock": url = f"{MOCKBASEURL}/shouldChangeTopicMock/{interview_id}"
        else: url = f"{BASEURL}/shouldChangeTopic/{interview_id}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AGENT_TOKEN')}"
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                resp.raise_for_status()
                result = await resp.json()
                return result.get("msg", {})
    except Exception as e:
        print(f"[get_history_data] Error: {str(e)}")
        return False
    

async def cleanup_agent_from_livekit(room_name: str, agent_identity: str):
    api_client = api.LiveKitAPI(
        os.getenv("LIVEKIT_URL"),         # e.g. https://your-project.livekit.cloud
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET"),
    )
    try:
        request = api.DeleteRoomRequest(room=room_name)
        await api_client.room.delete_room(request)
        print(f"[API] Removed participant {agent_identity} from room {room_name}")
    except Exception as e:
        print(f"[API] Failed to remove participant: {e}")