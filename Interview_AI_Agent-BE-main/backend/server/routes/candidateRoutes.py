from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from openai import OpenAI
from mongoengine import DoesNotExist, ValidationError, NotUniqueError
from models.candidateModel import Candidate
from models.interviewModel import Interview
from models.adminModel import Admin
from models.settingModel import Setting
from utils.response import make_response
from utils.generateID import generate_unique_id
from utils.imageUpload import upload_ss_drive
import os, tempfile, fitz, docx2txt, mammoth
from utils.agentToken import role_required
from groq import Groq

candidate_bp = Blueprint("candidate_bp", __name__)

@candidate_bp.route("/ping-openai", methods=["POST"])
def ping_openai():
    try:
        setting = Setting.objects.first()
        groq_ai_client = Groq(api_key=(setting.groq_api_key or os.environ.get("GROQ_API_KEY"))) 
        groq_ai_response = groq_ai_client.chat.completions.create(
            model = "llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "."}],
            max_tokens=2,
            temperature=0
        )
        response = groq_ai_response.choices[0].message.content.strip()
        return make_response(data={"response": "AI Agent is processing the data."}, msg="OpenAI ping successful", status_code=200)
    except Exception as e:
        error_str = str(e)
        
        # Handle 429 Rate Limit Error
        if "429" in error_str:
            if "insufficient_quota" in error_str or "quota" in error_str.lower():
                # Credit exhaustion error
                return make_response(
                    data={"response": "AI service temporarily unavailable due to quota limits. Please contact support."},
                    msg="Groq AI quota exceeded - credits may be exhausted",
                    status_code=200
                 )
            elif "rate_limit" in error_str.lower():
                # Rate limiting error
                return make_response(
                    data={"response": "AI service is experiencing high load. Please try again in a moment."},
                    msg="Groq AI rate limit reached - too many requests",
                    status_code=200
                )
            else:
                # Generic 429 error
                return make_response(
                    data={"response": "AI service temporarily unavailable. Please try again shortly."},
                    msg="Groq AI service limit reached",
                    status_code=200
                )
        
        # Handle other errors
        return make_response(
            data={"response": "AI service encountered an error. Please try again."},
            msg=f"Groq AI ping failed: {error_str}",
            status_code=200
        )
        
# Create Candidate
@candidate_bp.route("/create", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def create_candidate():
    try:
        admin_id = get_jwt_identity()
 
        setting = Setting.objects.first()
        # openai_client = OpenAI(api_key=setting.openai_api_key)
        groq_client = Groq(api_key=(setting.groq_api_key or os.environ.get("GROQ_API_KEY"))) 
        # Get form data
        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        skills_raw = request.form.get("skills", "")
        resume_file = request.files.get("resume")

        if not resume_file: 
            return make_response(msg="Resume file is required", status_code=400)

        filename = resume_file.filename.lower()

        # Validate extension
        allowed_extensions = [".pdf", ".docx", ".doc", ".txt"]
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            return make_response(msg="Unsupported file type. Upload PDF, DOCX, DOC, or TXT.", status_code=400)

        # ✅ Check if candidate with same email already exists for this admin
        if Candidate.objects(email=email, admin=admin_id, deleted=False).first():
            return make_response(
                msg="Candidate with this email already exists for this admin.",
                status_code=409
            )


        # Extract text depending on file type
        raw_text = ""
        file_bytes = resume_file.read()

        if filename.endswith(".pdf"):
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                for page in doc:
                    raw_text += page.get_text()

        elif filename.endswith(".docx"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            # Using mammoth for better parsing
            with open(tmp_path, "rb") as docx_file:
                result = mammoth.extract_raw_text(docx_file)
                raw_text = result.value

        elif filename.endswith(".doc"):
            return make_response(
                msg="Legacy .doc format not supported. Please upload .docx or PDF instead.",
                status_code=400
            )

        elif filename.endswith(".txt"):
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        # Verify extracted text
        if not raw_text.strip():
            return make_response(msg="Could not extract text from resume.", status_code=400)

        # Call OpenAI API to generate profile summary
        groq_ai_response = groq_client.chat.completions.create(
            model = "llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an assistant that writes professional profile summaries for resumes. Do NOT add extra things like 'here is the summary ...', Do NOT add emojis."},
                {"role": "user", "content": f"Here is the extracted resume content:\n\n{raw_text}\n\nWrite a concise professional profile summary for this candidate which can be used in the Interview later."}
            ],
            temperature=0.7
        )
        profile_summary = groq_ai_response.choices[0].message.content.strip()

        # Clean skills
        skills = [skill.strip() for skill in skills_raw.split(",") if skill.strip()]

        cand_id = generate_unique_id("candidate")
        mime_type = resume_file.content_type or "application/pdf"
        link = upload_ss_drive(file_bytes, f"C-{cand_id}", "resume", f"{name}_{cand_id}_resume.pdf", mime_type)
        
        # Store candidate
        candidate = Candidate(
            name=name,
            cand_id=f"C-{cand_id}",
            email=email,
            phone=phone,
            skills=skills,
            resume_url=link,  # You can replace this with an actual S3/Drive URL
            profile_summary=profile_summary,
            admin=admin_id
        )
        candidate.save()

        return make_response(data=candidate, msg="Candidate created", status_code=201)

    except ValidationError as e:
        return make_response(msg=str(e), status_code=400)

    except Exception as e:
        return make_response(msg=f"Something went wrong: {str(e)}", status_code=500)

# Get All Candidates for Admin
@candidate_bp.route("/list", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def list_candidates():
    admin_id = get_jwt_identity()

    # Get page and limit from query params
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
    except ValueError:
        return make_response(msg="Invalid pagination values", status_code=400)

    if page < 1 or limit < 1:
        return make_response(msg="Page and limit must be positive integers", status_code=400)

    # Query candidates for the admin
    queryset = Candidate.objects(admin=admin_id, deleted__ne=True).order_by("-created_at")

    total = queryset.count()
    candidates = queryset.skip((page - 1) * limit).limit(limit)

    items = []
    for candidate in candidates:
        # Fetch the most recent interview of this candidate
        recent_interview = (
            Interview.objects(candidate=candidate.id)
            .order_by("-created_at")
            .first()
        )

        items.append({
            "id": str(candidate.id),
            "cand_id": candidate.cand_id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "resume_url": candidate.resume_url,
            "skills": candidate.skills,
            "profile_summary": candidate.profile_summary,
            "created_at": candidate.created_at,
            "recent_interview": {
                "id": str(recent_interview.id) if recent_interview else None,
                "title": recent_interview.title if recent_interview else None,
                "scheduled_time": recent_interview.scheduled_time if recent_interview else None,
                "int_id": str(recent_interview.int_id) if recent_interview else None,
                "status": recent_interview.status if recent_interview else None
            }
        })

    return make_response(
        data={
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit  # ceiling division
        },
        msg="Candidate list fetched",
        status_code=200
    )

# Get Single Candidate by ID
@candidate_bp.route("/<string:candidate_id>", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def get_candidate(candidate_id):
    admin_id = get_jwt_identity()
    try:
        candidate = Candidate.objects.get(id=candidate_id, admin=admin_id)

        # Fetch most recent interview for this candidate
        recent_interview = (
            Interview.objects(candidate=candidate)
            .order_by("-created_at")
            .first()
        )

        interview_data = None
        if recent_interview:
            interview_data = {
                "int_id": recent_interview.int_id,
                "scheduled_time": recent_interview.scheduled_time,
                "title": recent_interview.title,
                "interview_id": str(recent_interview.id),
                "status": recent_interview.status,
            }

        return make_response(
            data={
                "candidate": candidate,
                "recent_interview": interview_data
            },
            msg="Candidate details fetched"
        )

    except DoesNotExist:
        return make_response(msg="Candidate not found", status_code=404)

# Update Candidate
@candidate_bp.route("/<string:candidate_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])
def update_candidate(candidate_id):
    admin_id = get_jwt_identity()
    try:
        candidate = Candidate.objects.get(id=candidate_id, admin=admin_id)
        setting = Setting.objects.first()
        groq_client = Groq(api_key=(setting.groq_api_key or os.environ.get("GROQ_API_KEY"))) 

        # Get form fields
        name = request.form.get("name", "")
        email = request.form.get("email", "")
        phone = request.form.get("phone", "")
        skills_raw = request.form.get("skills", "")
        resume_file = request.files.get("resume", None)
        deleted_str = request.form.get("deleted", "").lower()
        if deleted_str in ["true", "1", "yes"]:
            deleted = True
        elif deleted_str in ["false", "0", "no"]:
            deleted = False

        # Update fields
        if name: candidate.name = name
        if email: candidate.email = email
        if phone: candidate.phone = phone
        if deleted_str: candidate.deleted = deleted
        if Candidate.objects(email=email).first():
            return make_response(msg="Candidate with this email already exists.", status_code=409)  
        # Handle skills
        if skills_raw:
            candidate.skills = [skill.strip() for skill in skills_raw.split(",") if skill.strip()]

        # If resume uploaded, parse and generate profile summary
        if resume_file:
            file_bytes = resume_file.read()
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                text = ""
                for page in doc:
                    text += page.get_text()

            # Send text to OpenAI to generate profile summary
            try:
                completion = groq_client.chat.completions.create(
                    model = "llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": "You are an assistant that writes professional profile summaries for resumes. Do NOT add extra things like 'here is the summary ...', Do NOT add emojis."},
                        {"role": "user", "content": f"Here is the extracted resume content:\n\n{text}\n\nWrite a concise professional profile summary for this candidate which can be used in the Interview later."}
                    ],
                    temperature=0.7
                )
                summary = completion.choices[0].message.content.strip()
                candidate.profile_summary = summary
            except Exception as e:
                return make_response(msg=f"Groq AI failed: {str(e)}", status_code=500)
            mime_type = resume_file.content_type or "application/pdf"
            link = upload_ss_drive(file_bytes, f"{str(candidate.cand_id)}", "resume", f"{str(candidate.name)}_{str(candidate.cand_id)}_resume.pdf", mime_type)
            candidate.resume_url = link
        candidate.save()
        return make_response(data=candidate, msg="Candidate updated")

    except DoesNotExist:
        return make_response(msg="Candidate not found", status_code=404)
    except ValidationError as e:
        return make_response(msg=str(e), status_code=400)
    except Exception as e:
        return make_response(msg=f"Error: {str(e)}", status_code=500)

# Delete Candidate
@candidate_bp.route("/<string:candidate_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_candidate(candidate_id):
    admin_id = get_jwt_identity()
    try:
        candidate = Candidate.objects.get(id=candidate_id, admin=admin_id)
        candidate.deleted = True
        candidate.save()
        return make_response(msg="Candidate deleted")
    except DoesNotExist:
        return make_response(msg="Candidate not found", status_code=404)


@candidate_bp.route("/hard_delete/<string:candidate_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def hard_delete_candidate(candidate_id):
    admin_id = get_jwt_identity()
    try:
        candidate = Candidate.objects.get(id=candidate_id, admin=admin_id)
        candidate.delete()
        return make_response(msg="Candidate deleted")
    except DoesNotExist:
        return make_response(msg="Candidate not found", status_code=404)


@candidate_bp.route("/segregated", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def get_segregated_candidates():
    admin_id = get_jwt_identity()

    # Pagination params
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    # Fetch candidates sorted by created_at (descending)
    candidates_qs = Candidate.objects(admin=admin_id).order_by("-created_at")
    total_candidates = candidates_qs.count()

    candidates = candidates_qs.skip(skip).limit(limit)

    # Prepare segregation buckets
    segregated = {
        "scheduled": [],
        "completed": [],
        "cancelled": [],
        "no_interview_doc": []
    }

    for cand in candidates:
        # Find latest interview (if any) for this candidate
        interview = Interview.objects(candidate=cand).order_by("-scheduled_time", "-created_at").first()

        if not interview:
            segregated["no_interview_doc"].append({
                "cand_id": cand.cand_id,
                "name": cand.name,
                "resume_url": cand.resume_url,
                "profile_summary": cand.profile_summary,
                "phone": cand.phone,
                "email": cand.email,
                "created_at": cand.created_at,
                "id": str(cand.id)
            })
        else:
            if interview.status in ["scheduled", "in_progress"]:
                bucket = "scheduled"
            elif interview.status == "completed":
                bucket = "completed"
            elif interview.status == "cancelled":
                bucket = "cancelled"
            else:
                bucket = "no_interview_doc"  # fallback safety

            segregated[bucket].append({
                "id": str(cand.id),
                "cand_id": cand.cand_id,
                "name": cand.name,
                "email": cand.email,
                "resume_url": cand.resume_url,
                "profile_summary": cand.profile_summary,
                "phone": cand.phone,
                "status": interview.status,
                "created_at": cand.created_at,
                "scheduled_time": interview.scheduled_time,
                "title": interview.title,
                "link": interview.link
            })


    return make_response(
        data={
            "segregated": segregated,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_candidates": total_candidates,
                "total_pages": (total_candidates + limit - 1) // limit
            }
        },
        msg="Segregated candidate list"
    )


@candidate_bp.route("/deleted", methods=["GET"])
@jwt_required()
@role_required(["admin"])
def list_deleted_candidates():
    admin_id = get_jwt_identity()
    try:
        # Fetch all deleted candidates for this admin
        queryset = (
            Candidate.objects(admin=admin_id, deleted=True)
            .order_by("-created_at")
        )

        candidates = []
        for c in queryset:
            candidates.append({
                "id": str(c.id),
                "cand_id": c.cand_id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "skills": c.skills,
                "resume_url": c.resume_url,
                "profile_summary": c.profile_summary,
                "created_at": c.created_at,
            })

        return make_response(data=candidates, msg="Deleted candidates fetched")

    except Exception as e:
        return make_response(msg=str(e), status_code=400)
