from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from livekit import api
from difflib import SequenceMatcher
from models.interviewModel import Interview
from models.trainingDataModel import TrainingData
from models.candidateModel import Candidate
from models.adminModel import Admin
from models.settingModel import Setting
from utils.response import make_response
from utils.agentToken import require_agent_auth
from utils.generateID import generate_unique_id
from utils.imageUpload import upload_ss_drive
from utils.email import send_email
from mongoengine import ValidationError, DoesNotExist
import datetime, uuid, os
from bson import DBRef, ObjectId
from utils.agentToken import role_required

interview_bp = Blueprint("interview_bp", __name__)

# Create Interview
@interview_bp.route("/create", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def create_interview():
    claims = get_jwt()  # Extract JWT claims
    role = claims.get("role", "admin")  # default to admin
    admin_id = get_jwt_identity()
    data = request.json

    try:
        admin = Admin.objects.get(id=admin_id)
        setting = Setting.objects.first()
        if not setting:
            return make_response(msg="System settings not found", status_code=500)

        candidate = Candidate.objects.get(id=data.get("candidate_id"))
        unique_room_id = f"room-{uuid.uuid4().hex[:6]}"
        int_id = f"I-{generate_unique_id('interview')}"
        mail_url = os.getenv("MAIL_URL")

        # ✅ Skills assigned to this admin (used if admin)
        admin_allowed_skills = []
        if role == "admin":
            for adm in setting.admin_skills:
                if str(adm.admin_id) == str(admin_id):
                    admin_allowed_skills = [s.skill.lower() for s in adm.skills]
                    break

        # ✅ Candidate skills
        requested_skills = [s.lower() for s in (candidate.skills or [])]
        total_num_questions = 0

        # ✅ Calculate total num_questions based on role
        for req_skill in requested_skills:
            # Superadmin → can use all skills
            if role == "superadmin":
                for skill_obj in setting.skills:
                    if skill_obj.skill.lower() == req_skill:
                        total_num_questions += skill_obj.num_questions or 0

            # Admin → can only use their assigned skills (case-insensitive)
            elif role == "admin":
                if req_skill not in admin_allowed_skills:
                    return make_response(
                        msg=f"Unauthorized skill '{req_skill}'. Admin can only create interviews with their assigned skills.",
                        status_code=403
                    )
                for adm in setting.admin_skills:
                    if str(adm.admin_id) == str(admin_id):
                        for skill_obj in adm.skills:
                            if skill_obj.skill.lower() == req_skill:
                                total_num_questions += skill_obj.num_questions or 0

        total_num_questions = data.get("num_questions", total_num_questions)
        # if total_num_questions == 0:
        #     return make_response(
        #         msg="No matching skills found in allowed list or num_questions is 0",
        #         status_code=400
        #     )

        # ✅ Validate and parse scheduled_time
        scheduled_time = data.get("scheduled_time")
        if isinstance(scheduled_time, str):
            scheduled_time = datetime.datetime.fromisoformat(scheduled_time)
        elif isinstance(scheduled_time, (int, float)):
             scheduled_time = datetime.datetime.fromtimestamp(scheduled_time)
        elif scheduled_time is None:
            scheduled_time = datetime.datetime.now()

        # ✅ Create Interview record
        interview = Interview(
            admin=ObjectId(admin_id),
            candidate=candidate,
            int_id=int_id,
            agent_voice=data.get("agent_voice"),
            title=data.get("title"),
            model_type="Groq",
            scheduled_time=scheduled_time,
            num_questions=total_num_questions,
            room_id=unique_room_id,
            cand_token="",
        )
        interview.save()
        interview.link = f"{mail_url}/join?interviewId={interview.id}"
        interview.save()

        default_subject = "Interview Invitation"
        default_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Schedule Confirmation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .content {
            padding: 40px;
            color: #333333;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2c3e50;
        }
        .interview-details {
            background-color: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 25px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 15px;
            align-items: center;
        }
        .detail-label {
            font-weight: 600;
            color: #34495e;
            min-width: 140px;
            display: inline-block;
        }
        .detail-value {
            color: #2c3e50;
            flex: 1;
        }
        .interview-link {
            background-color: #667eea;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            margin-top: 10px;
            transition: background-color 0.3s ease;
        }
        .interview-link:hover {
            background-color: #5a6fd8;
        }
        .footer {
            background-color: #34495e;
            color: #bdc3c7;
            padding: 25px 40px;
            text-align: center;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
            }
            .detail-label {
                min-width: auto;
                margin-bottom: 5px;
            }
            .interview-link {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Interview Confirmation</h1>
        </div>
        <div class="content">
            <div class="greeting">
                Dear [CANDIDATE_NAME],
            </div>
            <p>Your interview has been scheduled. Please find the details below:</p>
            <div class="interview-details">
                <div class="detail-row">
                    <span class="detail-label">📋 Interview ID:</span>
                    <span class="detail-value">[INTERVIEW_ID]</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💼 Interview Title:</span>
                    <span class="detail-value">[INTERVIEW_TITLE]</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👤 Candidate:</span>
                    <span class="detail-value">[CANDIDATE_NAME]</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🔗 Interview Link:</span>
                    <span class="detail-value">
                        <a href="[INTERVIEW_LINK]" class="interview-link">Join Interview</a>
                    </span>
                </div>
            </div>
            <p>Please click the "Join Interview" button above at any time to attend your interview.</p>
            <p>Best regards,<br>HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email confirmation for your scheduled interview.</p>
        </div>
    </div>
</body>
</html>"""

        # ✅ Prepare and send email
        html_template = admin.mail_settings.html or default_html
        html_message = (
            html_template
            .replace('[INTERVIEW_ID]', int_id)
            .replace('[INTERVIEW_TITLE]', data['title'])
            .replace('[CANDIDATE_NAME]', candidate.name)
            .replace('[INTERVIEW_LINK]', f"{mail_url}/join?interviewId={interview.id}")
        )

        subject = admin.mail_settings.subject or default_subject
        if 'cc' not in data:
            data["cc"] = ""
            
        return_message = "Interview created"
        try:
            send_email(admin_id, subject, html_message, candidate.email, data.get("cc"))
        except Exception as e:
            return_message += f", but failed to send email: {str(e)}"                   

        return make_response(data=interview, msg=return_message, status_code=201)

    except DoesNotExist:
        return make_response(msg="Candidate not found", status_code=404)
    except (ValidationError, Exception) as e:
        return make_response(msg=str(e), status_code=400)

# Get Interview by ID
@interview_bp.route("/<string:interview_id>", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def get_interview(interview_id):
    try:
        interview = Interview.objects.get(id=interview_id)
        return make_response(data=interview, msg="Interview fetched")
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)


# List Interviews (Optional: filter by candidate_id)
@interview_bp.route("/list", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def list_interviews():
    candidate_id = request.args.get("candidate_id")
    admin_id = get_jwt_identity()
    query = Interview.objects
    # ✅ Pagination parameters
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    status = request.args.get("status", None)
    skip = (page - 1) * limit
    if candidate_id:
        query = query.filter(candidate=candidate_id)
    if status: 
        query = query.filter(status=status)
    query = query.filter(admin=admin_id)

    total = query.count()  # ✅ total before pagination
    interviews = query.order_by("-created_at").skip(skip).limit(limit)

    items = []
    for interview in interviews:
        interview_data = {
            "id": str(interview.id),
            "int_id": interview.int_id,
            "status": interview.status,
            "model_type": interview.model_type,
            "scheduled_time": interview.scheduled_time,
            "title": interview.title,
            "link": interview.link,
            "history": interview.history,
            "feedback": interview.feedback,
            "selected": interview.selected,
            "topic_covered": interview.topic_covered,
            "score": interview.score,
            "room_id": interview.room_id,
            "cand_token": interview.cand_token,
            "agent_voice": getattr(interview, "agent_voice", None),
            "images": interview.images,
            "num_questions": interview.num_questions,
            "created_at": interview.created_at,
        }

        candidate_info = {
            "cand_id": None,
            "name": None,
            "email": None,
            "phone": None,
            "resume_url": None,
            "skills": None,
            "profile_summary": None,
            "created_at": None,
        }

        candidate_ref = getattr(interview, "_data", {}).get("candidate")

        if candidate_ref:
            try:
                # candidate_ref could be DBRef or ObjectId
                candidate_id = candidate_ref.id if isinstance(candidate_ref, DBRef) else candidate_ref
                candidate_doc = Candidate.objects.get(id=candidate_id)
                candidate_info = {
                    "cand_id": candidate_doc.cand_id,
                    "name": candidate_doc.name,
                    "email": candidate_doc.email,
                    "phone": candidate_doc.phone,
                    "resume_url": candidate_doc.resume_url,
                    "skills": candidate_doc.skills,
                    "profile_summary": candidate_doc.profile_summary,
                    "created_at": candidate_doc.created_at,
                }
            except DoesNotExist:
                pass


        interview_data["candidate"] = candidate_info
        items.append(interview_data)

    return make_response(
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit  # ✅ ceiling division
        },
        msg="Interview list fetched"
    )

# Update Interview
@interview_bp.route("/<string:interview_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])
def update_interview(interview_id):
    data = request.json
    try:
        interview = Interview.objects.get(id=interview_id)

        if "status" in data:
            interview.status = data["status"]
        if "scheduled_time" in data:
            interview.scheduled_time = datetime.datetime.fromisoformat(data["scheduled_time"])
        # if "link" in data:
        #     interview.link = data["link"]
        if "feedback" in data:
            interview.feedback = data["feedback"]
        if "selected" in data:
            interview.selected = data["selected"]
        if "history" in data:
            interview.history = data["history"]
        if "score" in data:
            interview.score = data["score"]
        if "title" in data:
            interview.title = data["title"]
        if "agent_voice" in data:
            interview.agent_voice = data["agent_voice"]
        if "num_questions" in data:
            interview.num_questions = data["num_questions"]

        interview.save()
        return make_response(data=interview, msg="Interview updated")

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        return make_response(msg=str(e), status_code=400)


# Delete Interview
@interview_bp.route("/<string:interview_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_interview(interview_id):
    try:
        interview = Interview.objects.get(id=interview_id)
        interview.delete()
        return make_response(msg="Interview deleted")
    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)


@interview_bp.route("/agent/getInterviewData/<string:interview_id>", methods=["GET"])
@require_agent_auth
def get_interview_token(interview_id):
    try:
        interview = Interview.objects.get(id=interview_id)
        candidate = interview.candidate

        interview_admin_id = str(interview.admin.id) if interview.admin else None
        if not interview_admin_id:
            return make_response(msg="Old Interview and admin not set", status_code=400)

        setting = Setting.objects.first()
        if not setting:
            return make_response(msg="No settings found with skill configuration", status_code=400)

        # For now, derive role from DB (you can replace this with claims later if needed)
        role = "admin"
        if hasattr(interview.admin, "role") and interview.admin.role == "superadmin":
            role = "superadmin"

        skill_question_map = {}

        # ✅ Get admin-specific or global skills configuration
        if role == "superadmin":
            # Superadmin → all skills
            skill_settings_map = {s.skill.lower(): s.num_questions for s in setting.skills or []}
        else:
            # Admin → only their own skill set
            admin_entry = next(
                (adm for adm in setting.admin_skills if str(adm.admin_id) == str(interview_admin_id)),
                None
            )
            if not admin_entry or not admin_entry.skills:
                return make_response(msg="No skills assigned to this admin in settings", status_code=400)
            skill_settings_map = {s.skill.lower(): s.num_questions for s in admin_entry.skills or []}

        # ✅ If relevant questions not filled yet, generate them
        if not interview.relevant_questions:
            candidate_skills = [skill.lower() for skill in (candidate.skills or [])]
            matched_questions = []

            # Load admin's training data
            training_sets = TrainingData.objects(admin=interview_admin_id)

            for skill in candidate_skills:
                num_required = skill_settings_map.get(skill, 0)
                if num_required <= 0:
                    continue

                skill_questions = []

                # 1️⃣ Match domain exactly (case-insensitive)
                for training in training_sets:
                    if training.domain.lower() == skill:
                        for q in training.questions:
                            # Ensure the skill is in tags
                            if skill not in [t.lower() for t in q.tags]:
                                q.tags.append(skill)
                            skill_questions.append(q)

                # 2️⃣ Match by tags
                for training in training_sets:
                    for q in training.questions:
                        tag_lowers = [t.lower() for t in q.tags]
                        if skill in tag_lowers:
                            if skill not in [t.lower() for t in q.tags]:
                                q.tags.append(skill)
                            skill_questions.append(q)

                # Deduplicate questions by question text
                skill_questions = list({str(q.question).strip().lower(): q for q in skill_questions}.values())

                # Select required number
                selected = skill_questions[:num_required]
                matched_questions.extend(selected)

                skill_question_map[skill] = {
                    "required": num_required,
                    "selected": len(selected)
                }

            # Save into interview
            interview.relevant_questions = matched_questions
            interview.updated_at = datetime.datetime.utcnow()
            interview.save()

        else:
            # ✅ Rejoin case — rebuild map based on what already exists
            for skill, num_required in skill_settings_map.items():
                selected_count = 0
                for q in interview.relevant_questions or []:
                    tags = [t.lower() for t in getattr(q, "tags", [])]
                    domain = getattr(q, "domain", "").lower()
                    if skill in tags or domain == skill:
                        selected_count += 1

                skill_question_map[skill] = {
                    "required": num_required,
                    "selected": selected_count
                }

        result = {
            "interview": interview,
            "candidate": candidate,
            "skill_question_map": skill_question_map
        }

        return make_response(data=result, msg="Interview and candidate data fetched", status_code=200)

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        return make_response(msg=f"Error fetching data: {str(e)}", status_code=500)

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts (0.0 to 1.0)"""
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, text1.strip().lower(), text2.strip().lower()).ratio()

@interview_bp.route("/agent/chatUpdate", methods=["PUT"])
@require_agent_auth
def update_interview_history():
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

        interview = Interview.objects.get(id=interview_id)

        # ✅ DUPLICATE CHECK - Only if history exists
        if interview.history:
            last_entry = interview.history[-1]
            last_question = last_entry.get("question", "")
            last_answer = last_entry.get("answer", "")
            
            question_similarity = calculate_similarity(user, last_question)
            answer_similarity = calculate_similarity(agent, last_answer)
            
            # Case 1: Exact duplicate - Skip
            if question_similarity >= 0.90 and answer_similarity >= 0.90:
                print(f"[DUPLICATE SKIPPED] Q:{question_similarity:.2f} A:{answer_similarity:.2f}")
                return make_response(data={"interview": interview, "duplicate": True }, msg="Duplicate skipped", status_code=200)
            
            # Case 2: Same question, longer answer - Update last entry
            if question_similarity >= 0.90 and len(agent) > len(last_answer) and answer_similarity < 0.90:
                print(f"[ANSWER UPDATED] Old:{len(last_answer)} New:{len(agent)}")
                interview.history[-1]["answer"] = agent
                interview.history[-1]["score"] = score
                
                # Recalculate score
                valid_scores = [e["score"] for e in interview.history if isinstance(e.get("score"), int) and e["score"] >= 0]
                interview.score = round(sum(valid_scores) / len(valid_scores)) if valid_scores else 0
                interview.save()
                
                return make_response(data={"interview": interview, "duplicate": True }, msg="Answer updated", status_code=200)
            
            # Case 3: Same question, shorter answer - Skip (keep original)
            if question_similarity >= 0.90 and len(agent) <= len(last_answer):
                print(f"[SHORTER ANSWER SKIPPED]")
                return make_response(data={"interview": interview, "duplicate": True }, msg="Shorter duplicate skipped", status_code=200)

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

        return make_response(data={"interview": interview, "duplicate": False}, msg="Interview feedback updated", status_code=200)

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return make_response(msg=f"Error updating feedback: {str(e)}", status_code=500)

@interview_bp.route("/agent/<string:interview_id>", methods=["PUT"])
@require_agent_auth
def update_interview2(interview_id):
    data = request.json
    try:
        interview = Interview.objects.get(id=interview_id)

        if "status" in data:
            interview.status = data["status"]

        interview.save()
        return make_response(data=interview, msg="Interview updated")

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        return make_response(msg=str(e), status_code=400)


@interview_bp.route("/agent/shouldChangeTopic/<interview_id>", methods=["GET"])
@require_agent_auth
def should_change_topic(interview_id):
    try:
        interview = Interview.objects.get(id=interview_id)

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
                    msg=f"Please change topic to another strong point of the candidate and ask questions from this dataset {interview.relevant_questions}"
                ) 
            else:
                return make_response(
                    data={"change_topic": True, "topic_covered": interview.topic_covered},
                    msg="Please change topic to another strong point of the candidate."
                )
        else:
            if history_len % 2 == 0:
                question_list = [str(q.question) for q in interview.relevant_questions]
                print(question_list)
                return make_response(
                    data={"change_topic": True, "topic_covered": topic_covered},
                    msg=f"Topic change not required yet, keep asking on this topic from the candidate and ask questions from this dataset only {question_list}"
                )
            return make_response(
                data={"change_topic": False, "topic_covered": topic_covered},
                msg="Topic change not required yet, keep asking on this topic."
            )

    except DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)
    except Exception as e:
        return make_response(msg=f"Server error: {str(e)}", status_code=500)

@interview_bp.route("/list_with_interviews", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def list_candidates_with_interviews():
    try:
        # Filters
        status = request.args.get("status")
        selected = request.args.get("selected")
        title = request.args.get("title")
        sort_score = request.args.get("sort_score", "false").lower() == "true"
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))

        # Base candidate query
        candidates = Candidate.objects().order_by("-created_at")

        # Pagination
        total_candidates = candidates.count()
        candidates = candidates.skip((page - 1) * limit).limit(limit)

        result = []
        for candidate in candidates:
            # Build interview query per candidate
            interview_query = Interview.objects(candidate=candidate).order_by("-created_at")

            # Apply filters
            if status:
                interview_query = interview_query.filter(status=status)
            if selected is not None:
                interview_query = interview_query.filter(selected=selected.lower() == "true")
            if title:
                interview_query = interview_query.filter(title__icontains=title)

            # Sorting
            if sort_score:
                interview_query = interview_query.order_by("-score")
            else:
                interview_query = interview_query.order_by("-created_at")

            # Interviews list
            interviews_list = [
                {
                    "id": str(interview.id),
                    "status": interview.status,
                    "title": interview.title,
                    "link": interview.link,
                    "selected": interview.selected,
                    "score": interview.score,
                    "scheduled_time": interview.scheduled_time,
                    "room_id": interview.room_id,
                    "int_id": interview.int_id,
                    "num_questions": interview.num_questions,
                    "created_at": interview.created_at,
                }
                for interview in interview_query
            ]

            result.append({
                "candidate": {
                    "id": str(candidate.id),
                    "cand_id": candidate.cand_id,
                    "name": candidate.name,
                    "email": candidate.email,
                    "phone": candidate.phone,
                    "skills": candidate.skills,
                    "profile_summary": candidate.profile_summary,
                    "created_at": candidate.created_at,
                },
                "interviews": interviews_list
            })

        return make_response(
            data={
                "results": result,
                "total_candidates": total_candidates,
                "page": page,
                "limit": limit,
                "pages": (total_candidates + limit - 1) // limit
            },
            msg="Candidates with interviews fetched successfully",
            status_code=200
        )

    except Exception as e:
        return make_response(msg=f"Something went wrong: {str(e)}", status_code=500)


@interview_bp.route("/upload/image", methods=["POST"])
def upload_interview_image():
    try:
        interview_id = request.form.get("interview_id")
        image_file = request.files.get("image")

        if not interview_id or not image_file:
            return make_response(msg="Missing interview ID or image file", status_code=400)

        # Validate image type
        if not image_file.mimetype.startswith("image/"):
            return make_response(msg="Uploaded file is not an image", status_code=400)

        # Fetch interview
        interview = Interview.objects.get(id=interview_id)

        # Create image name
        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"{interview.int_id}_img_{timestamp}.{image_file.filename.rsplit('.', 1)[-1]}"

        # Upload image (replace with your actual implementation)
        image_url = upload_ss_drive(image_file.read(), interview.int_id, "images", filename, image_file.mimetype)

        # Update interview document
        interview.images.append(image_url)
        interview.save()

        return make_response(data={"image_url": image_url}, msg="Image uploaded successfully", status_code=200)

    except Interview.DoesNotExist:
        return make_response(msg="Interview not found", status_code=404)

    except Exception as e:
        return make_response(msg=f"Something went wrong: {str(e)}", status_code=500)
