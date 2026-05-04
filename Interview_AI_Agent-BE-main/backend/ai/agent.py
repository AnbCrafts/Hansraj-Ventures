from __future__ import annotations
import asyncio
import random, time
from livekit import agents
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    llm  
)

from livekit.agents import AgentSession
from livekit.plugins import google 
from livekit.plugins.google.beta import MultimodalLiveModel
from dotenv import load_dotenv
from api import InterviewAgent
from db_driver import get_interview_data, get_mock_interview_data
import logging, os

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

load_dotenv()


async def entrypoint(ctx: JobContext):

    interviewId = os.getenv("INTERVIEW_ID")
    actual_room_name = os.getenv("ROOM_NAME")
    agent_voice = os.getenv("AGENT_VOICE") or "Puck"
    role = os.getenv("INTERVIEW_ROLE")
    
    await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_ALL)
    if not interviewId:
        print("Error: INTERVIEW_ID environment variable not set")
        return
    
    print("AGENT STARTED:", os.getenv("INTERVIEW_ID"), os.getenv("ROOM_NAME"))
    
    for _ in range(60):  # 60 tries × 5s = 5 minutes
        try: 
            num = ctx.room.num_participants
            # print(f"Current participant count: {num}")
            if num > 1:
                break
            await asyncio.sleep(5)
        except Exception as e:
            print(f"Polling error: {e}")
            await asyncio.sleep(5)
    else:
        print("Timeout: No candidate joined.")
        return
    try:
        if role == "mock": interview_data = await get_mock_interview_data(interviewId) 
        else: interview_data = await get_interview_data(interviewId)
        # Create the agent and associate it with the model
        session = AgentSession(
        llm=google.beta.MultimodalLiveModel(
        model="gemini-2.0-flash-exp", 
        voice=agent_voice ,                 # Options: "Puck", "Charon", "Kore", "Fenrir", "Aoede"
        ),

    min_interruption_words=3,
    min_interruption_duration=2.0,
    min_endpointing_delay=0.5,
    max_endpointing_delay=2.0,
)
        
        interview_data["data"]["interviewId"] = interviewId
        interview_data["data"]["room_name"] = actual_room_name
        interview_data["data"]["role"] = role
        agent = InterviewAgent(interview_data=interview_data)
        # Start the agent session
        await session.start(room=ctx.room, agent=agent)
        await agent.on_session_started(session)
        # session.say(text="The interview has concluded. Thank you for your time. Goodbye!",  allow_interruptions=True)

    except Exception as e:
        print(f"Error in agent entrypoint: {e}")
        raise
        




if __name__ == "__main__":

    room_name = os.getenv("ROOM_NAME", "default")
    agent_token = os.getenv("AGENT_TOKEN_MEET", "default")
    # print("Agent room name-", room_name)
    # print("Agent token-", agent_token)
    agents.cli.run_app(agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name=f"hv{room_name}",
        _worker_token=agent_token
    ))
  