import openai, asyncio
import os, re, time
from livekit.agents import function_tool, Agent, RunContext
from prompts import INSTRUCTIONS, MOCK_INSTRUCTIONS
from dotenv import load_dotenv
from difflib import SequenceMatcher
import logging

from db_driver import update_chat_history, get_history_data, cleanup_agent_from_livekit

load_dotenv() 

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


class InterviewAgent(Agent):

    def restore_state_from_history(self):
        """Restore interview state from saved history when rejoining."""
        if not self.history:
            return
        
        # print(f"[REJOIN] Restoring state from {len(self.history)} history entries")
        
        # Reset counters
        self.skill_progress = {s: 0 for s in self.skill_question_map.keys()}
        self.total_asked = 0
        self.asked_ids = set()
        self.asked_questions = []
        
        # Process each history entry to rebuild state
        for entry in self.history:
            question_text = entry.get("question", "")
            question_id = entry.get("question_id", "")  # Get saved question ID
            
            if not question_text:
                continue
            
            # If we have a question_id, add it directly to asked_ids
            if question_id:
                self.asked_ids.add(question_id)
                # print(f"[REJOIN] Added question_id to asked_ids: {question_id}")
            
            # Find which question this matches and determine skill
            matched_question = None
            question_skill = None
            
            for q in self.relevant_questions:
                q_text = q.get("question", str(q))
                q_id = q.get("question_id", "")
                
                # Match by question_id first (more reliable), then by text
                if (question_id and q_id == question_id) or q_text.strip() == question_text.strip():
                    matched_question = q
                    
                    # Find which skill this question belongs to
                    for skill in self.skill_question_map.keys():
                        if skill.lower() in [t.lower() for t in q.get("tags", [])]:
                            question_skill = skill
                            break
                    break
            
            if matched_question and question_skill:
                # Update skill progress
                self.skill_progress[question_skill] = self.skill_progress.get(question_skill, 0) + 1
                self.total_asked += 1
                
                # Add to asked questions list
                self.asked_questions.append({
                    "text": question_text,
                    "skill": question_skill,
                    "source": "training",
                    "question_id": question_id
                })
                
                # print(f"[REJOIN] Restored question: {question_text[:50]}... (Skill: {question_skill}, ID: {question_id})")
            else:
                # If no match found, still count it as asked (might be fallback question)
                self.total_asked += 1
                # print(f"[REJOIN] Could not match question: {question_text[:50]}... (ID: {question_id})")
        
        print(f"[REJOIN] Final state - Total asked: {self.total_asked}, Skills progress: {self.skill_progress}")


    def normalize_name(self, name: str) -> str:
        """Normalize name for comparison by removing extra spaces, converting to lowercase, etc."""
        if not name:
            return ""
        # Remove extra whitespace, convert to lowercase, remove common prefixes
        normalized = re.sub(r'\s+', ' ', name.strip().lower())
        # Remove common prefixes like "my name is", "i am", etc.
        prefixes_to_remove = [
            "my name is", "i am", "this is", "i'm", "my full name is",
            "the name is", "it's", "it is", "myself"
        ]
        for prefix in prefixes_to_remove:
            if normalized.startswith(prefix):
                normalized = normalized[len(prefix):].strip()
        return normalized

    def calculate_name_similarity(self, provided_name: str, expected_name: str) -> float:
        """Calculate similarity between provided and expected names"""
        provided_normalized = self.normalize_name(provided_name)
        expected_normalized = self.normalize_name(expected_name)
        
        # Use sequence matcher for similarity
        similarity = SequenceMatcher(None, provided_normalized, expected_normalized).ratio()
        
        # Also check if all parts of expected name are in provided name
        expected_parts = expected_normalized.split()
        provided_parts = provided_normalized.split()
        
        if len(expected_parts) > 0:
            matching_parts = sum(1 for part in expected_parts 
                               if any(part in p_part or p_part in part 
                                    for p_part in provided_parts))
            part_similarity = matching_parts / len(expected_parts)
            
            # Take the maximum of sequence similarity and part similarity
            similarity = max(similarity, part_similarity)
        
        return similarity


    def get_next_question(self):
        """Return the next question strictly based on quotas and fallback if needed."""
         # Update tracking
        self.total_asked += 1
        
        if self.total_asked >= self.total_required:
            return None  # Interview done

        for skill, quota in self.skill_question_map.items():
            required = quota["selected"]
            asked = self.skill_progress.get(skill, 0)
            if asked < required:
                # Try preloaded questions - now using question_id for filtering
                available = [
                    q for q in self.relevant_questions
                    if skill.lower() in [t.lower() for t in q.get("tags", [])]
                    and q.get("question_id", "") not in self.asked_ids  # Use question_id instead of id(q)
                ]
                
                print(f"Available questions for {skill}: {len(available)}")
                print(f"Asked IDs: {self.asked_ids}")
                
                if available:
                    q = available[0]  # take first unused
                    qid = q.get("question_id", "")  # Get the question_id
                    self.asked_ids.add(qid)

                    next_q = {
                        "text": q.get("question", str(q)),
                        "skill": skill,
                        "source": "training",
                        "question_id": qid
                    }
                    print("Using training question:", next_q)
                else:
                    # Fallback - generate unique ID for fallback questions
                    fallback_id = f"fallback_{skill}_{self.total_asked}_{hash(skill + str(self.total_asked)) % 10000}"
                    
                    next_q = {
                        "text": f"Can you describe a challenging project you've worked on using {skill}? What problems did you solve and how?",
                        "skill": skill,
                        "source": "fallback",
                        "question_id": fallback_id
                    }
                    self.asked_ids.add(fallback_id)
                    print("Using fallback question:", next_q)
                self.skill_progress[skill] = asked + 1
                self.asked_questions.append(next_q)
                    
                return next_q

        return None
    

    def __init__(self, interview_data=None):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.interview_data = interview_data.get("data") or {}
        # print(self.interview_data)
        self.interview_id = self.interview_data.get("interviewId")
        self.role = self.interview_data.get("role","role")

        self.candidate_name = self.interview_data.get("candidate", {}).get("name", "the candidate")
        if self.role == "real":
            self.domain = self.interview_data.get("candidate", {}).get("skills", ["not specified"])
            self.profile_summary = self.interview_data.get("candidate", {}).get("profile_summary", "not specified")
            self.relevant_questions = self.interview_data.get("interview", {}).get("relevant_questions", []) or []
        else:
            self.domain = self.interview_data.get("interview",{}).get("skills",[])
            self.profile_summary = self.interview_data.get("interview", {}).get("resume",{}).get("summary", "not specified")
            self.relevant_questions = []
            
        # Name verification state
        self.name_verified = False
        # self.name_verification_attempts = 0
        # self.max_name_verification_attempts = 3

        self.interview_started = False
        self.awaiting_question_fetch = False

        # Maintain chat history
        self.history = self.interview_data.get("interview", {}).get("history", []) or []
        self.skill_question_map = self.interview_data.get("skill_question_map", {}) or {}
        self.room_name = self.interview_data.get("interview", {}).get("room_id", "room")
        self.asked_ids = set()

        # print(self.skill_question_map)
        # print(self.relevant_questions)

        # Tracking state
        self.asked_questions = []
        self.skill_progress = {s: 0 for s in self.skill_question_map.keys()}
        self.total_required = self.interview_data.get("interview", {}).get("num_questions", 10)
        self.total_asked = 0
        self.current_question = None

        if len(self.history) > 0:
            self.restore_state_from_history()

        # Store static system prompt separately
        skills_str = ", ".join(self.domain) if isinstance(self.domain, list) else self.domain

        # Determine if this is a rejoin scenario
        is_rejoin = len(self.history) >= 5
        
        if is_rejoin:
            # Rejoin scenario - mention previous questions and continue where left off
            previous_questions = ""
            if self.history:
                last_qa_pairs = self.history[-5:]
                previous_questions = "Previous questions asked:\n"
                for turn in last_qa_pairs:
                    q = turn.get("question", "")
                    if q:
                        previous_questions += f"- {q}\n"
                previous_questions += "\nDo not repeat these questions. "
            
            if self.role == "real":
                post_verification_instruction = (
                    f"{previous_questions}"
                    "After name verification is successful, say: 'Great! Now let's continue with your interview. "
                    "Based on our previous conversation, I'll ask you some new questions to further evaluate your skills. "
                    "Let's pick up where we left off.' Then proceed with NEW questions, Always use 'get_next_question' to get the next question you need to ask."
                )
            else:
                post_verification_instruction = (
                    f"{previous_questions}"
                    "After name verification is successful, say: 'Great! Now let's continue with your interview. "
                    "Based on our previous conversation, I'll ask you some new questions to further evaluate your skills. "
                    "Let's pick up where we left off.' Then proceed with NEW questions."
                )
        else:
            if self.role == "real":
            # Fresh start scenario
                post_verification_instruction = (
                    "After name verification is successful, say: 'Perfect! Now let's begin your interview. "
                    "I'll be asking you questions to assess your knowledge and experience. "
                    "Let's start with some questions from your skills.' Then proceed with questions, Always use 'save_chat' to get the next question you need to ask."
                )
            else:
                # Fresh start scenario
                post_verification_instruction = (
                    "After name verification is successful, say: 'Perfect! Now let's begin your interview. "
                    "I'll be asking you questions to assess your knowledge and experience. "
                    "Let's start with some questions from your skills."
                )
        if self.role == "real":
            self.system_prompt = {
                "role": "system",
                "content": (
                    f"{INSTRUCTIONS}  Your task is to interview a candidate who will identify themselves at the start of the session.  "
                    f"with interview ID {self.interview_id} who has experience in: {skills_str}. "
                    f"Profile summary: {self.profile_summary}. "
                    f"First do initial greetings and ask for name verification. Only verify name once per active interview session."
                    f"{post_verification_instruction} "
                    f"IMPORTANT: You must ask exactly {self.total_required} questions total. "
                    + (
                        "Always use the 'save_chat'  function to get the next question. "
                        "Never generate your own questions - only ask the questions provided by the function. "
                        if self.role == "real"
                        else ""
                    )
                    + "After asking each question, wait for the candidate's response before proceeding and dont forget to use save_chat function to save chat history."
                )
            }
        else:
            self.system_prompt = {
                "role": "system",
                "content": (
                    f"{MOCK_INSTRUCTIONS}  Your task is to interview a mock candidate who will identify themselves at the start of the session.  "
                    f"with interview ID {self.interview_id} who has experience in: {skills_str}. "
                    f"Profile summary: {self.profile_summary}. "
                    f"First do initial greetings and ask for name verification. Only verify name once per active interview session."
                    f"{post_verification_instruction} "
                    f"IMPORTANT: You must ask exactly {self.total_required} questions total. "
                    + (
                        "After asking each question, wait for the candidate's response before proceeding and dont forget to use 'save_chat' function to save chat history."
                    )
                )
            }


        self.chat_log = []
        super().__init__(instructions=self.system_prompt["content"])

    async def on_session_started(self, session: RunContext):
        """
        Called automatically once the agent session starts and room connection is active.
        Perfect place to send the first greeting.
        """
        # print(f"[InterviewAgent] Session started in room: {self.room_name}")

        await asyncio.sleep(1)

        # Now greet the candidate
        greeting = f"Hello ! Great to meet you. Could you please confirm your full name before we begin?"

        await  session.say(text=greeting, allow_interruptions=True)


    @function_tool()
    async def verify_candidate_name(self, ctx: RunContext, provided_name: str) -> str:
        """Verify if the provided name matches the expected candidate name."""
        try:
            # print(f"Name verification attempt {self.name_verification_attempts}")
            if self.name_verified:
                return "Name is already verified."
            
            # Calculate similarity
            similarity = self.calculate_name_similarity(provided_name, self.candidate_name)
            # print(f"Provided name: '{provided_name}', Expected name: '{self.candidate_name}', Name similarity: {similarity:.2f}")
            
            # Consider names matching if similarity is above threshold (0.7 = 70%)
            similarity_threshold = 0.8
            
            if similarity >= similarity_threshold:
                self.name_verified = True
                # print("Name verification successful!")
                return (
                    f"Name verification successful! Hello {self.candidate_name}, "
                    f"welcome to your interview for interview ID {self.interview_id}. "
                    "Let's begin with some questions about your background and experience."
                )
            else:
                return (
                    f"I'm sorry, the name '{provided_name}' doesn't match our records. "
                    f"Could you please state your full name again?"
                )
                    
        except Exception as e:
            print(f"Error in name verification: {e}")
            return "There was an error verifying your name. Could you please try again?"

    # @function_tool()
    # async def get_next_interview_question(self, ctx: RunContext) -> str:
    #     """Get the next interview question from the training dataset."""
    #     if not self.name_verified:
    #         return "ERROR: Name must be verified first before asking interview questions."
        
    #     next_question = self.get_next_question()
        
    #     if next_question is None:
    #         return (
    #             f"You have asked all {self.total_required} required questions. Now ask question from your own knowledge about the candidate's skills, experience, and summary, but don't say like 'I have covered all the formal questions' "
    #         )
        
    #     self.current_question = next_question
    #     question_text = next_question["text"]
    #     skill = next_question["skill"]
        
    #     return (
    #         f"Ask this question: \"{question_text}\"\n"
    #         f"[This is question {self.total_asked}/{self.total_required} focusing on {skill} skills]"
    #     )

    # @function_tool()
    # async def check_interview_status(self, ctx: RunContext) -> str:
    #     """Check if the interview can proceed (name verified)."""
    #     if not self.name_verified:
    #         return (
    #             "🔍 STATUS: Name verification required. "
    #             "Ask the candidate to state their full name and call verify_candidate_name()."
    #         )
    #     elif self.total_asked >= self.total_required:
    #         return (
    #             f"✅ STATUS: Interview complete! All {self.total_required} questions have been asked. "
    #             "Thank the candidate and end the interview."
    #         )
    #     else:
    #         return (
    #             f"📋 STATUS: Interview in progress. "
    #             f"Progress: {self.total_asked}/{self.total_required} questions asked. "
    #             # f"NEXT ACTION: Call get_next_interview_question() to get the next question."
    #         )

    @function_tool()
    async def fetch_candidate_info(self, ctx: RunContext) -> str:
        """Fetch candidate info from DB for a given interview ID."""
        try:
            skills = self.domain
            if self.role == "real":  relevant_questions = self.relevant_questions
            else: relevant_questions = "No relevant question for this dataset. Ask Questions from Your knowledge"

            return (
                # f"Candidate Name: {self.candidate_name}\n"
                f"Skills: {', '.join(skills) if isinstance(skills, list) else skills}\n"
                f"Profile Summary: {self.profile_summary}"
                f"Questions Set: {relevant_questions}"
            )

        except Exception as e:
            logger.error(f"[fetch_candidate_info] Error: {str(e)}")
            return f"Error fetching interview data: {str(e)}"

    # @function_tool()
    # async def get_interview_progress(self, ctx: RunContext) -> str:
    #     """Get current interview progress and next steps."""
    #     if not self.name_verified:
    #         return "Name verification pending."
        
    #     progress = f"Progress: {self.total_asked}/{self.total_required} questions asked\n"
    #     progress += "Skills progress:\n"
        
    #     for skill, asked in self.skill_progress.items():
    #         required = self.skill_question_map[skill]["required"]
    #         progress += f"- {skill}: {asked}/{required} questions\n"
        
    #     if self.total_asked >= self.total_required:
    #         progress += "\nInterview is complete!"
    #     else:
    #         progress += f"\nNext: Use get_next_interview_question to get question {self.total_asked + 1}"
        
    #     return progress
    
    # @function_tool()
    # async def save_chat_history(self, ctx: RunContext, agentQuestion: str, userAnswer: str, score: int) -> str:
    #     """Save chat turn to DB for auditing."""
    #     try:
    #         print("[save_chat_history] Saving chat turn to DB")
    #         question_id = None
    #         if self.current_question:
    #             question_id = self.current_question.get("question_id", "")
    #         success = await update_chat_history(self.interview_id, agentQuestion, userAnswer, score, self.role, question_id)
    #         return "Chat saved successfully." if success else "Failed to save chat."
    #     except Exception as e:
    #         logger.error(f"[save_chat_history] Error: {str(e)}")
    #         return f"Error saving chat: {str(e)}"

    # @function_tool()
    # async def get_topic_change(self, ctx: RunContext) -> str:
    #     try:
    #         data = await get_history_data(self.interview_id, self.role)
            
    #         return data
    #     except Exception as e:
    #         logger.error(f"[get_topic_change] Error: {str(e)}")
    #         return f"Error fetching topic change: {str(e)}"
        
        
    @function_tool()
    async def save_chat(self, ctx: RunContext, agentQuestion: str, userAnswer: str, score: int) -> str:
        """Save chat turn to DB for auditing and get next question or status summary."""
        # print(f"total_asked before saving: {self.total_asked}")
        try:
            if not self.name_verified:
                return (
                    "STATUS: Name verification required. "
                    "Ask the candidate to state their full name and call verify_candidate_name()."
                )

            #########################
            # SAVE CHAT TO DB LOGIC
            question_id = None
            if self.current_question:
                question_id = self.current_question.get("question_id", "")
                
            duplicate = await update_chat_history(self.interview_id, agentQuestion, userAnswer, score, self.role, question_id)
            #########################
            if duplicate:
                self.total_asked -= 1
                # print(f"bcz of duplicate total_asked before saving: {self.total_asked}")
                
            # print(f"[save_chat] API Response: is_duplicate={duplicate}")
            # #########################
            # # FETCH CANDIDATE INFO LOGIC
            # skills = self.domain
            # relevant_questions = (
            #     self.relevant_questions if self.role == "real"
            #     else "No relevant question for this dataset. Ask questions from your knowledge."
            # )
            # candidate_info = (
            #     f"Skills: {', '.join(skills) if isinstance(skills, list) else skills}\n"
            #     f"Profile Summary: {self.profile_summary}\n"
            #     f"Questions Set: {relevant_questions}"
            # )
            # #########################

            #########################
            # GET TOPIC CHANGE LOGIC
            topic_data = await get_history_data(self.interview_id, self.role)
            # print(f"[save_chat] API Response: topic_data={topic_data}")
            #########################

            #########################
            # CHECK INTERVIEW STATUS LOGIC
            if self.role == "real":
                if self.total_asked >= self.total_required:
                    status_message = (
                        f"STATUS: Interview complete! All {self.total_required} questions have been asked. "
                        "Thank and greet the candidate and end the interview, Use 'end_conversation' tool to leave the room, but greet before that."
                    )
                    next_question_text = None
                else:
                    status_message = (
                        f"STATUS: Interview in progress. "
                        f"Progress: {self.total_asked}/{self.total_required} questions asked."
                    )

                    # --- GET NEXT QUESTION LOGIC ---
                    next_question = self.get_next_question()
                    if next_question is None:
                        next_question_text = (
                            f"You have asked all {self.total_required} required questions. "
                            "Now ask from your own knowledge about the candidate's skills, experience, and summary, "
                            "but don't say like 'I have covered all the formal questions.'"
                        )
                        self.current_question = None
                    else:
                        self.current_question = next_question
                        question_text = next_question["text"]
                        skill = next_question["skill"]
                        next_question_text = (
                            f"Ask this question: \"{question_text}\"\n"
                            f"[This is question {self.total_asked}/{self.total_required} focusing on {skill} skills]"
                        )
            else:
                if self.total_asked >= self.total_required:
                    status_message = (
                        f"STATUS: Interview complete! All {self.total_required} questions have been asked. "
                        "Thank the candidate and end the interview, Use 'end_conversation' tool to leave the room, but greet before that."
                    )
                    next_question_text = None
                else:
                    status_message = (
                        """Keep Asking intelligent, relevant, and skill-based questions using your own knowledge — guided by the candidate's profile, resume, or topic."""
                    )
                    next_question_text = (
                        """Keep Asking intelligent, relevant, and skill-based questions using your own knowledge — guided by the candidate's profile, resume, or topic."""                
                    )
            #########################

            ########################################################
            # FINALIZED RETURN STATEMENT (UNIFIED STRUCTURE)
            ########################################################
            return (
                f"### INTERVIEW FLOW UPDATE ###\n\n"
                "Chat Save Status: 'Success'\n"
                f"Interview Status: {status_message}\n\n"
                # f"Candidate Info:\n{candidate_info}\n\n"
                f"Topic Change Data:\n{topic_data}\n\n"
                f"Next Action:\n"
                f"{next_question_text if next_question_text else 'No further questions. End the interview politely. [INSTRUCTION] First greet the candidate by saying Thank you for your time. This concludes your interview. then  CALL the tool \'end_conversation\' tool to leave the room.'}\n\n"
            )

        except Exception as e:
            logger.error(f"[save_chat] Error: {str(e)}")
            return f"Error in save_chat: {str(e)}"

    @function_tool()
    async def end_conversation(self, ctx: RunContext) -> str:

        try:
            time.sleep(7)
            await cleanup_agent_from_livekit(self.room_name, "identity")
            return "Conversation ended and agent has left the room."
        except Exception as e:
            return f"Failed to end session: {str(e)}"