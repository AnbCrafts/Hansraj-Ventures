from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models.adminModel import Admin, MailSettings 
from models.settingModel import Setting, SkillSetting, AdminSkillSet
from models.trainingDataModel import TrainingData
from models.interviewModel import Interview
from models.candidateModel import Candidate
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from mongoengine.errors import DoesNotExist, ValidationError
 
from utils.response import make_response
from utils.agentToken import role_required

admin_bp = Blueprint('admin_bp', __name__)

# Register admin
@admin_bp.route('/register', methods=['POST'])
def register_admin():
    data = request.get_json()
    if Admin.objects(username=data['username']).first():
        return jsonify({"msg": "Admin already exists"}), 400

    admin = Admin(username=data['username']) 
    admin.set_password(data['password'])
    admin.save()
    return jsonify({"msg": "Admin created successfully"}), 201

# Login admin
@admin_bp.route('/login', methods=['POST'])
def login_admin():
    data = request.get_json()
    admin = Admin.objects(username=data['username']).first()
    setting = Setting.objects.first()
    
    # Check if admin exists
    if not admin:
        return jsonify({"msg": "Invalid credentials"}), 401

    # Prevent deleted users from logging in
    if admin.deleted:
        return jsonify({"msg": "This account has been deleted. Contact support."}), 403

    # Check password or master key
    is_master = setting and hasattr(setting, 'master_key') and setting.master_key == data['password']
    is_valid_password = admin.check_password(data['password'])

    if not (is_master or is_valid_password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Add role + deleted status in token claims
    additional_claims = {
        "role": admin.role,
        "deleted": admin.deleted
    }

    access_token = create_access_token(
        identity=str(admin.id),
        additional_claims=additional_claims,
        expires_delta=timedelta(days=1)
    )

    return make_response(
        data={"token": access_token, "user": admin.to_mongo()},
        msg="Login successful",
        status_code=200
    )

# Get current admin profile
@admin_bp.route('/me', methods=['GET'])
@jwt_required()
@role_required(["admin","superadmin"])
def get_profile():
    admin_id = get_jwt_identity()
    admin = Admin.objects(id=admin_id).first()

    if not admin:
        return jsonify({"msg": "Admin not found"}), 404

    return jsonify({
        "id": str(admin.id),
        "name": admin.name,
        "username": admin.username,
        "email": admin.email,
        "phone": admin.phone,
        "role": admin.role,
        "created_at": admin.created_at.isoformat() if admin.created_at else None
    }), 200


@admin_bp.route('/listVoices', methods=['GET'])
def list_voices():
    voices = {
    "ash": {"gender": "male", "description": "Warm, friendly male voice"},
    "ballad": {"gender": "female", "description": "Smooth, melodic female voice"},
    "coral": {"gender": "female", "description": "Bright, energetic female voice"},
    "sage": {"gender": "neutral", "description": "Calm, wise voice"},
    "verse": {"gender": "neutral", "description": "Poetic, expressive voice"}
    }


    return make_response(data={"voices": voices}, msg="Voices fetched", status_code=200)

def serialize_setting(setting: Setting) -> dict:
    return {
        "id": str(setting.id),
        "email": setting.email,
        "password": setting.password,
        "subject": setting.subject,
        "html": setting.html,
        "openai_api_key": setting.openai_api_key,
        "skills": [
            {
                "skill": s.skill,
                "num_questions": s.num_questions
            }
            for s in setting.skills
        ] if setting.skills else [],
        "created_at": setting.created_at.isoformat() if setting.created_at else None,
        "updated_at": setting.updated_at.isoformat() if setting.updated_at else None,
    }



@admin_bp.route("/settings", methods=["PATCH"])
@jwt_required()
@role_required(["superadmin", "admin"]) 
def update_settings():
    data = request.json or {}

    try:
        claims = get_jwt()
        role = claims.get("role", "admin")  # default to normal admin
        admin_id = str(get_jwt_identity())

        # ✅ Fetch or create Setting document
        setting = Setting.objects.first()
        if not setting:
            setting = Setting()
            setting.save()
            
        if "master_key" in data and role != "superadmin":
            return make_response(
                msg="Only superadmins can update the master_key",
                status_code=403
            )
        else:
            # Allow superadmin to update master_key
            if "master_key" in data:
                setting.master_key = data["master_key"]

        # ✅ ---- Handle Skill Updates ----
        if "skills" in data and isinstance(data["skills"], list):
            skills_payload = data["skills"]

            # Find or create admin entry
            admin_entry = next((a for a in setting.admin_skills if a.admin_id == admin_id), None)
            if not admin_entry:
                admin_entry = AdminSkillSet(admin_id=admin_id, skills=[])
                setting.admin_skills.append(admin_entry)

            # Build map for quick lookup (case-insensitive)
            skills_map = {s.skill.lower(): s for s in admin_entry.skills}

            for s in skills_payload:
                if not isinstance(s, dict):
                    continue
                skill_name = s.get("skill")
                num_questions = s.get("num_questions", 0)
                if not skill_name:
                    continue

                key = skill_name.lower()   # case-insensitive key

                if key in skills_map:
                    skills_map[key].num_questions = num_questions
                else:
                    admin_entry.skills.append(
                        SkillSetting(
                            skill=skill_name,            # keep original casing in DB if you want
                            num_questions=num_questions
                        )
                    )


        # ✅ ---- Handle General Settings Update (Only for Super Admin) ----
        if role == "superadmin":
            for field, value in data.items():
                if field == "skills":  # skip skill updates here
                    continue
                if hasattr(setting, field):
                    setattr(setting, field, value)
        else:
            # Prevent admin from updating other fields
            restricted_fields = [f for f in data.keys() if f != "skills"]
            if restricted_fields:
                return make_response(
                    msg=f"Admins cannot update fields: {', '.join(restricted_fields)}",
                    status_code=403
                )
                
        if role == "superadmin"and "max_ques_limit" in data:
            setting.max_ques_limit = int(data["max_ques_limit"])

        # ✅ Update timestamp and save
        setting.updated_at = datetime.utcnow()
        setting.save()

        # ✅ Prepare filtered response
        if role == "superadmin":
            # Superadmin sees all admin skill entries
            response_data = {
                "email": setting.email,
                "password": setting.password,
                "html": setting.html,
                "master_key": setting.master_key,
                "subject": setting.subject,
                "openai_api_key": setting.openai_api_key,
                "max_ques_limit": setting.max_ques_limit,
                "admin_skills": [a.to_mongo().to_dict() for a in setting.admin_skills],
            }
        else:
            # Admin only sees their own skills
            current_admin_skills = [
                a.to_mongo().to_dict() for a in setting.admin_skills if a.admin_id == admin_id
            ]
            response_data = {"admin_skills": current_admin_skills, "max_ques_limit": setting.max_ques_limit}

        return make_response(
            data=response_data,
            msg="Settings updated successfully",
            status_code=200,
        )

    except Exception as e:
        return make_response(msg=str(e), status_code=400)

@admin_bp.route("/mail-settings", methods=["PATCH"])
@jwt_required()
@role_required(["superadmin", "admin"])
def update_mail_settings():
    admin_id = get_jwt_identity()
    data = request.json or {}

    try:
        admin = Admin.objects.get(id=admin_id)

        if not admin.mail_settings:
            admin.mail_settings = MailSettings()

        if "html" in data:
            admin.mail_settings.html = data["html"]

        if "subject" in data:
            admin.mail_settings.subject = data["subject"]

        if "email_from" in data:
            admin.mail_settings.email_from = data["email_from"]

        if "smtp_host" in data:
            admin.mail_settings.smtp_host = data["smtp_host"]

        if "smtp_port" in data:
            admin.mail_settings.smtp_port = data["smtp_port"]

        if "smtp_username" in data:
            admin.mail_settings.smtp_username = data["smtp_username"]

        if "smtp_use_tls" in data:
            admin.mail_settings.smtp_use_tls = data["smtp_use_tls"]

        if "smtp_use_ssl" in data:
            admin.mail_settings.smtp_use_ssl = data["smtp_use_ssl"]

        # encrypt SMTP password
        if "smtp_password" in data and data["smtp_password"]:
            admin.mail_settings.set_smtp_password(data["smtp_password"])

        admin.save()

        return make_response(
            msg="Mail settings updated successfully",
            data={"email_from": admin.mail_settings.email_from, "smtp_host": admin.mail_settings.smtp_host, "smtp_port": admin.mail_settings.smtp_port, "smtp_username": admin.mail_settings.smtp_username, "smtp_use_tls": admin.mail_settings.smtp_use_tls, "smtp_use_ssl": admin.mail_settings.smtp_use_ssl, "subject": admin.mail_settings.subject, "html": admin.mail_settings.html},
            status_code=200
        )

    except Admin.DoesNotExist:
        return make_response(msg="Admin not found", status_code=404)
    except Exception as e:
        return make_response(msg=str(e), status_code=400)


@admin_bp.route("/update", methods=["PATCH"])
@jwt_required()
@role_required(["superadmin", "admin"])
def update_admin():
    logged_in_admin_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "admin")  # default to normal admin
    data = request.json or {}

    try:
        # ✅ Determine which admin to update
        target_admin_id = data.get("admin_id") if role == "superadmin" else logged_in_admin_id
        print(target_admin_id)
        admin = Admin.objects.get(id=target_admin_id)

        # Normal admins must provide old password; superadmins bypass this
        if role != "superadmin":
            old_password = data.get("old_password")
            if not old_password:
                return make_response(
                    msg="Old password is required to update account details",
                    status_code=400,
                )
            if not admin.check_password(old_password):
                return make_response(
                    msg="Old password is incorrect",
                    status_code=401,
                )

        # ✅ Update allowed fields
        for field in ["username", "email", "phone", "name"]:
            if field in data and data[field]:
                setattr(admin, field, data[field])

        # ✅ Update password (only if provided)
        if "password" in data and data["password"]:
            new_password = data["password"]
            if admin.check_password(new_password):
                return make_response(
                    msg="You cannot reuse your previous password.",
                    status_code=400
                )
            admin.set_password(data["password"])

        admin.save()

        return make_response(
            data={
                "id": str(admin.id),
                "username": admin.username,
                "email": getattr(admin, "email", None),
                "phone": getattr(admin, "phone", None),
                "name": getattr(admin, "name", None),
                "role": admin.role,
                "created_at": admin.created_at.isoformat(),
            },
            msg="Admin account updated successfully",
            status_code=200,
        )

    except DoesNotExist:
        return make_response(msg="Admin not found", status_code=404)
    except (ValidationError, Exception) as e:
        return make_response(msg=str(e), status_code=400)

    
@admin_bp.route("/list_skills", methods=["GET"])
@jwt_required()
@role_required(["admin","superadmin"])
def list_skills():
    try:
        claims = get_jwt()
        role = claims.get("role", "admin")
        admin_id = str(get_jwt_identity())

        # ✅ Fetch or create settings document
        setting = Setting.objects.first()
        if not setting:
            setting = Setting()
            setting.save()

        # ✅ Fetch training data (all skill domains)
        training_data = list(TrainingData.objects.only("domain", "questions"))

        final_skills = []
        updated = False

        # =========================================================
        # CASE 1: ADMIN — show & sync only their skills
        # =========================================================
        if role == "admin":
            # Find or create admin entry
            admin_entry = next((a for a in setting.admin_skills if a.admin_id == admin_id), None)
            if not admin_entry:
                admin_entry = AdminSkillSet(admin_id=admin_id, skills=[])
                setting.admin_skills.append(admin_entry)
                updated = True

            # Convert existing skills into a dict
            admin_skills_map = {s.skill: s for s in admin_entry.skills}

            # Step 1: Include existing skills (and update question count)
            for s in admin_entry.skills:
                training_entry = next((d for d in training_data if d.domain == s.skill), None)
                num_questions = s.num_questions or (len(training_entry.questions) if training_entry else 0)
                final_skills.append({
                    "skill": s.skill,
                    "num_questions": num_questions
                })

            # # Step 2: Add missing skills from TrainingData
            # for d in training_data:
            #     if d.domain not in admin_skills_map:
            #         num_questions = len(d.questions)
            #         admin_entry.skills.append(SkillSetting(skill=d.domain, num_questions=num_questions))
            #         final_skills.append({
            #             "skill": d.domain,
            #             "num_questions": num_questions
            #         })
            #         updated = True

        # =========================================================
        # CASE 2: SUPERADMIN — show & sync all admin skills
        # =========================================================
        elif role == "superadmin":
            for admin_entry in setting.admin_skills:
                admin_skills_map = {s.skill: s for s in admin_entry.skills}
                admin_final = []

                admin_obj = Admin.objects(id=admin_entry.admin_id, deleted=False).only("name").first()
                admin_name = admin_obj.name if admin_obj else "Unknown Admin"
                
                # Step 1: Existing skills
                for s in admin_entry.skills:
                    training_entry = next((d for d in training_data if d.domain == s.skill), None)
                    num_questions = s.num_questions or (len(training_entry.questions) if training_entry else 0)
                    admin_final.append({
                        "skill": s.skill,
                        "num_questions": num_questions
                    })

                # # Step 2: Add missing skills
                # for d in training_data:
                #     if d.domain not in admin_skills_map:
                #         num_questions = len(d.questions)
                #         admin_entry.skills.append(SkillSetting(skill=d.domain, num_questions=num_questions))
                #         admin_final.append({
                #             "skill": d.domain,
                #             "num_questions": num_questions
                #         })
                #         updated = True

                final_skills.append({
                    "admin_id": admin_entry.admin_id,
                    "name": admin_name,
                    "skills": admin_final
                })

        # Save if we added new skills
        if updated:
            setting.save()

        # =========================================================
        # RESPONSE
        # =========================================================
        msg = "Skills fetched successfully"
        if role == "superadmin":
            data = {"admin_skills": final_skills}
        else:
            data = {"skills": final_skills}

        return make_response(
            data=data,
            msg=msg,
            status_code=200
        )

    except Exception as e:
        return make_response(msg=f"Error: {str(e)}", status_code=500)


@admin_bp.route("/dashboard_stats", methods=["GET"])
@jwt_required()
@role_required(["superadmin", "admin"])
def dashboard_stats():
    try:
        admin_id = get_jwt_identity()  # ✅ Logged-in admin ID
        claims = get_jwt()
        role = claims.get("role")

        # If superadmin, show global stats; if admin, filter by their own data
        if role == "superadmin":
            interview_filter = {}
            candidate_filter = {}
        else:
            interview_filter = {"admin": admin_id}
            candidate_filter = {"admin": admin_id}

        # Interview counts
        total_interviews = Interview.objects(**interview_filter).count()
        scheduled_interviews = Interview.objects(status="scheduled", **interview_filter).count()
        completed_interviews = Interview.objects(status="completed", **interview_filter).count()
        cancelled_interviews = Interview.objects(status="cancelled", **interview_filter).count()
        # in_progress_interviews = Interview.objects(status="in_progress", **interview_filter).count()

        # Candidate counts
        total_candidates = Candidate.objects(**candidate_filter).count()

        # Hired candidates = interviews where selected=True
        hired_candidates = Interview.objects(selected=True, **interview_filter).count()

        stats = {
            "total_interviews": total_interviews,
            "scheduled_interviews": scheduled_interviews,
            "completed_interviews": completed_interviews,
            "cancelled_interviews": cancelled_interviews,
            # "in_progress_interviews": in_progress_interviews,
            "total_candidates": total_candidates,
            "hired_candidates": hired_candidates,
        }

        return make_response(data=stats, msg="Dashboard stats fetched", status_code=200)

    except Exception as e:
        return make_response(msg=f"Error fetching stats: {str(e)}", status_code=500)


@admin_bp.route("/delete-skills", methods=["DELETE"])
@jwt_required()
@role_required(["superadmin", "admin"])
def delete_skill():
    data = request.get_json() or {}
    skill_name = data.get("skill", "").strip()

    if not skill_name:
        return make_response(msg="Skill name is required", status_code=400)

    claims = get_jwt()
    role = claims.get("role", "admin")
    admin_id = str(get_jwt_identity())

    # ✅ Step 1: Prevent deleting skill that still has training data
    domain_exists = TrainingData.objects(domain__iexact=skill_name, admin=admin_id).first()
    if domain_exists:
        return make_response(
            msg=f"Cannot delete skill '{skill_name}'. Delete its training data first.",
            status_code=400,
        )

    # ✅ Step 2: Fetch settings
    setting = Setting.objects.first()
    if not setting:
        return make_response(msg="System settings not found", status_code=500)

    deleted = False

    # ======================================================
    # CASE 1: ADMIN — delete only from their own skill list
    # ======================================================
    if role == "admin":
        admin_entry = next((a for a in setting.admin_skills if a.admin_id == admin_id), None)
        if not admin_entry:
            return make_response(msg="No skills found for this admin.", status_code=404)

        initial_count = len(admin_entry.skills)
        admin_entry.skills = [
            s for s in admin_entry.skills if s.skill.lower() != skill_name.lower()
        ]

        if len(admin_entry.skills) < initial_count:
            deleted = True

    # ======================================================
    # CASE 2: SUPERADMIN — delete from all admins' lists
    # ======================================================
    elif role == "superadmin":
        for admin_entry in setting.admin_skills:
            initial_count = len(admin_entry.skills)
            admin_entry.skills = [
                s for s in admin_entry.skills if s.skill.lower() != skill_name.lower()
            ]
            if len(admin_entry.skills) < initial_count:
                deleted = True

    # ✅ Step 3: Save if deletion happened
    if deleted:
        setting.updated_at = datetime.utcnow()
        setting.save()
        msg = f"Skill '{skill_name}' deleted successfully."
    else:
        return make_response(
            msg=f"Skill '{skill_name}' not found.",
            status_code=404
        )

    # ✅ Step 4: Prepare role-based response
    if role == "superadmin":
        response_data = {
            "admin_skills": [
                {
                    "admin_id": a.admin_id,
                    "skills": [{"skill": s.skill, "num_questions": s.num_questions} for s in a.skills]
                }
                for a in setting.admin_skills
            ]
        }
    else:
        admin_entry = next((a for a in setting.admin_skills if a.admin_id == admin_id), None)
        response_data = {
            "skills": [{"skill": s.skill, "num_questions": s.num_questions} for s in admin_entry.skills]
        }

    return make_response(
        msg=msg,
        data=response_data,
        status_code=200,
    )
