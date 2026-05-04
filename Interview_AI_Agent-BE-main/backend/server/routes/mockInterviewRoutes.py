from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from livekit import api
from bson import ObjectId   
from models.mockInterviewModel import MockInterview, Resume
from models.trainingDataModel import TrainingData
from models.userModel import User
from models.settingModel import Setting
from utils.response import make_response
from utils.agentToken import require_agent_auth
from utils.generateID import generate_unique_id
from mongoengine import ValidationError, DoesNotExist
from difflib import SequenceMatcher
import datetime, uuid, os, json
from dotenv import load_dotenv
load_dotenv()

mock_interview_bp = Blueprint("mock_interview_bp", __name__)

# Create Interview
@mock_interview_bp.route("/create", methods=["POST"])
@jwt_required()
def create_interview():
    user_id = get_jwt_identity()
    data = request.json
    try:
        user = User.objects.get(id=user_id)
        unique_room_id = f"room-{uuid.uuid4().hex[:6]}"
        int_id = f"I-{generate_unique_id('mock')}"
        skills = data.get("skills")
        mail_url = os.getenv("MAIL_URL")
        resume_id = data.get("resume_id")   # 👈 Expect resume_id from client
        total_num_questions = data.get("num_questions")
         
        # === 💰 Check and Deduct Credits (Prepaid System) ===
        INTERVIEW_COST = float(os.getenv("INTERVIEW_COST", 0.5))
        if user.credits < INTERVIEW_COST:
            return make_response(
                msg="Insufficient credits. Please purchase more credits to schedule an interview.",
                status_code=402  # Payment Required
            )

        # Deduct credit immediately
        user.credits -= INTERVIEW_COST
        user.save()
        
        if total_num_questions == 0:
            return make_response(
                msg="No matching skills found in settings or num_questions is 0",
                status_code=400
            )

        selected_resume = None
        for res in user.resumes:
            if str(res.resume_id) == str(resume_id):
                selected_resume = res
                break

        if not selected_resume:
            return make_response(
                msg="Resume not found for this user",
                status_code=404
            )

        # ✅ Create Interview with attached resume (including summary/description)
        interview = MockInterview(
            user=user,
            int_id=int_id,
            agent_voice=data.get("agent_voice"),
            title=data.get("title"),
            num_questions=total_num_questions,
            room_id=unique_room_id,
            cand_token="",
            skills=skills,
            resume=Resume(  # 👈 Pass an EmbeddedDocument instance
                resume_id=selected_resume.resume_id,
                file=selected_resume.file,
                summary=selected_resume.summary
            ),
            credit_used=INTERVIEW_COST
        )
        interview.save()

        interview.link = f"{mail_url}/join?interviewId={interview.id}"
        interview.save()
        return make_response(data=interview, msg="Interview created", status_code=201)

    except DoesNotExist:
        return make_response(msg="Candidate not found", status_code=404)
    except (ValidationError, Exception) as e:
        return make_response(msg=str(e), status_code=400)



# Get Interview by ID
@mock_interview_bp.route("/<string:interview_id>", methods=["GET"])
@jwt_required()
def get_interview(interview_id):
    try:
        interview = MockInterview.objects.get(id=interview_id)
        if interview:
            if len(interview.history) >= interview.num_questions:
                interview.status = "completed"
                interview.save()
        return make_response(data=interview, msg="Interview fetched")
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)


# List Interviews (Optional: filter by candidate_id)
@mock_interview_bp.route("/list", methods=["GET"])
@jwt_required()
def list_interviews():
    user_id = get_jwt_identity()
    if not user_id:
        return make_response(
            data={},
            msg="user_id is required",
            status=400
        )

    # Pagination params
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    # Filter and sort
    query = MockInterview.objects(user=user_id)
    total = query.count()

    interviews = query.order_by("-created_at").skip(skip).limit(limit)

    items = []
    for interview in interviews:
        if len(interview.history) >= interview.num_questions:
            interview.status = "completed"
            interview.save()
        interview_data = {
            "id": str(interview.id),
            "int_id": interview.int_id,
            "title": interview.title,
            "link": interview.link,
            "history": interview.history,
            "feedback": interview.feedback,
            "resume": interview.resume,
            "score": interview.score,
            "room_id": interview.room_id,
            "cand_token": interview.cand_token,
            "agent_voice": getattr(interview, "agent_voice", None),
            "num_questions": interview.num_questions,
            "status": getattr(interview, "status", None),
            "credit_used": float(os.getenv("INTERVIEW_COST", 0.5)),
            "created_at": interview.created_at.isoformat() if interview.created_at else None,
        }
        items.append(interview_data)

    # Pagination meta info
    pagination_info = {
        "current_page": page,
        "limit": limit,
        "total_records": total,
        "total_pages": (total + limit - 1) // limit,  # ceiling division
        "has_next": (page * limit) < total,
        "has_prev": page > 1
    }

    return make_response(
        data={"items": items, "pagination": pagination_info},
        msg="Interview list fetched successfully",
        status_code=200
    )

# Update Interview
@mock_interview_bp.route("/<string:interview_id>", methods=["PUT"])
@jwt_required()
def update_interview(interview_id):
    user_id = get_jwt_identity()
    data = request.json
    try:
        interview = MockInterview.objects.get(id=interview_id)
        if "title" in data:
            interview.title = data["title"]
        if "agent_voice" in data:
            interview.agent_voice = data["agent_voice"]
        if "num_questions" in data:
            interview.num_questions = data["num_questions"]
        if "skills" in data:
            interview.skills = data["skills"]
        if "resume" in data:
            resume_id = data["resume"]
            user = User.objects.get(id=user_id)
            selected_resume = None
            for res in user.resumes:
                if str(res.resume_id) == str(resume_id):
                    selected_resume = res
                    break
            if not selected_resume:
                return make_response(
                    msg="Resume not found for this user",
                    status_code=404
                )
            interview.resume = Resume(  # 👈 Pass an EmbeddedDocument instance
                resume_id=selected_resume.resume_id,
                file=selected_resume.file,
                summary=selected_resume.summary
            )
        interview.save()
        return make_response(data=interview, msg="Interview updated")

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        return make_response(msg=str(e), status_code=400)


# Delete Interview
@mock_interview_bp.route("/<string:interview_id>", methods=["DELETE"])
@jwt_required()
def delete_interview(interview_id):
    try:
        interview = MockInterview.objects.get(id=interview_id)
        interview.delete()
        return make_response(msg="Interview deleted")
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)


@mock_interview_bp.route("/agent/getMockInterviewData/<string:interview_id>", methods=["GET"])
@require_agent_auth
def get_mock_interview_token(interview_id):
    try:
        interview = MockInterview.objects.get(id=interview_id)
        candidate = interview.user

        # If relevant questions not filled yet, generate them
        # if not interview.relevant_questions:
        #     candidate_skills = [skill.lower() for skill in candidate.skills]
        #     training_sets = TrainingData.objects()

        #     matched_questions = []

        #     for training in training_sets:
        #         domain_lower = training.domain.lower()
        #         if domain_lower in candidate_skills:
        #             matched_questions.extend(training.questions)
        #         else:
        #             for q in training.questions:
        #                 tag_lowers = [t.lower() for t in q.tags]
        #                 if any(skill in [t.lower() for t in q.tags] for skill in candidate_skills):
        #                     matched_questions.append(q)

            # Keep top 20 questions max
            # interview.relevant_questions = matched_questions[:20]
            # interview.save()

        result = {
            "interview": json.loads(interview.to_json()),
            "candidate": json.loads(candidate.to_json())
        }

        return make_response(data=result, msg="Interview and candidate data fetched")
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        print(e)
        return make_response(msg=f"Error fetching data: {str(e)}", status_code=500)
    
def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts (0.0 to 1.0)"""
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, text1.strip().lower(), text2.strip().lower()).ratio()

@mock_interview_bp.route("/agent/chatUpdateMock", methods=["PUT"])
@require_agent_auth
def update_mock_interview_history():
    data = request.json
    
    try:
        interview_id = data.get("interview_id")
        user = data.get("user")  # question
        agent = data.get("agent")  # answer
        score = data.get("score")
        question_id = data.get("question_id")
        
        try: 
            score = int(score)
        except (TypeError, ValueError): 
            score = 0
        
        if not interview_id:
            return make_response(msg="Missing required fields", status_code=400)
        
        interview = MockInterview.objects.get(id=interview_id)
        
        # ✅ DUPLICATE CHECK - Only if history exists
        if interview.history:
            last_entry = interview.history[-1]
            last_question = last_entry.get("question", "")
            last_answer = last_entry.get("answer", "")
            
            question_similarity = calculate_similarity(user, last_question)
            answer_similarity = calculate_similarity(agent, last_answer)
            
            # Case 1: Exact duplicate - Skip
            if question_similarity >= 0.90 and answer_similarity >= 0.90:
                print(f"[MOCK DUPLICATE SKIPPED] Q:{question_similarity:.2f} A:{answer_similarity:.2f}")
                return make_response(
                    data={
                        "interview": interview,
                        "duplicate": True
                    }, 
                    msg="Duplicate skipped", 
                    status_code=200
                )
            
            # Case 2: Same question, longer answer - Update last entry
            if question_similarity >= 0.90 and len(agent) > len(last_answer) and answer_similarity < 0.90:
                print(f"[MOCK ANSWER UPDATED] Old:{len(last_answer)} New:{len(agent)}")
                interview.history[-1]["answer"] = agent
                interview.history[-1]["score"] = score
                
                # Recalculate score
                valid_scores = [e["score"] for e in interview.history if isinstance(e.get("score"), int) and e["score"] >= 0]
                interview.score = round(sum(valid_scores) / len(valid_scores)) if valid_scores else 0
                interview.save()
                
                return make_response(
                    data={
                        "interview": interview,
                        "duplicate": True
                    },
                    msg="Answer updated", 
                    status_code=200
                )
            
            # Case 3: Same question, shorter answer - Skip (keep original)
            if question_similarity >= 0.90 and len(agent) <= len(last_answer):
                print(f"[MOCK SHORTER ANSWER SKIPPED]")
                return make_response(
                    data={
                        "interview": interview,
                        "duplicate": True
                    },
                    msg="Shorter duplicate skipped", 
                    status_code=200
                )
        
        # ✅ NO DUPLICATE - Add new entry
        history_entry = {
            "question": user or "[no input]",
            "answer": agent or "[no response]",
            "score": score,
            "question_id": question_id
        }
        
        interview.history.append(history_entry)
        
        # Recalculate total score
        valid_scores = [e["score"] for e in interview.history if isinstance(e.get("score"), int) and e["score"] >= 0]
        interview.score = round(sum(valid_scores) / len(valid_scores)) if valid_scores else 0
        interview.save()
        
        return make_response(
            data={
                "interview": interview,
                "duplicate": False
            },
            msg="Interview feedback updated", 
            status_code=200
        )
        
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        print(f"[MOCK ERROR] {str(e)}")
        return make_response(msg=f"Error updating feedback: {str(e)}", status_code=500)

@mock_interview_bp.route("/agent/<string:interview_id>", methods=["PUT"])
@require_agent_auth
def update_mock_interview2(interview_id):
    data = request.json
    try:
        interview = MockInterview.objects.get(id=interview_id)

        if "status" in data:
            interview.status = data["status"]

        interview.save()
        return make_response(data=interview, msg="Interview updated")

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        return make_response(msg=str(e), status_code=400)

@mock_interview_bp.route("/agent/shouldChangeTopicMock/<interview_id>", methods=["GET"])
@require_agent_auth
def should_mock_change_topic(interview_id):
    try:
        interview = MockInterview.objects.get(id=interview_id)

        history_len = len(interview.history)
        topic_covered = interview.topic_covered or 0
        num_questions = interview.num_questions
        if history_len // num_questions > 0 :
            interview.status = "completed"
            interview.save()
            return make_response(
                data={"change_topic": True, "topic_covered": topic_covered},
                msg="Ok that's enough. End the interview now by calling the end_conversation function."
            )
        # Check if it's time to increment topic
        if history_len // 5 > topic_covered:
            interview.topic_covered += 1
            interview.save()
            if history_len % 3 == 0:
                return make_response(
                    data={"change_topic": True, "topic_covered": interview.topic_covered},
                    msg=f"Please change topic to another strong point of the candidate and ask questions from his/her skills."
                ) 
            else:
                return make_response(
                    data={"change_topic": True, "topic_covered": interview.topic_covered},
                    msg="Please change topic to another strong point of the candidate."
                )
        else:
            if history_len % 2 == 0:
                return make_response(
                    data={"change_topic": True, "topic_covered": topic_covered},
                    msg=f"Topic change not required yet, keep asking on this topic from the candidate and ask questions from this dataset only"
                )
            return make_response(
                data={"change_topic": False, "topic_covered": topic_covered},
                msg="Topic change not required yet, keep asking on this topic."
            )
 
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        print(e)
        return make_response(msg=f"Server error: {str(e)}", status_code=500)