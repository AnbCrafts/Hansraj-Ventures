from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from mongoengine import ValidationError, DoesNotExist
from models.trainingDataModel import TrainingData, TrainingQuestion
from models.settingModel import Setting, SkillSetting, AdminSkillSet
from models.interviewModel import Interview
from utils.response import make_response
from utils.agentToken import require_agent_auth, role_required
import datetime
from bson import ObjectId

training_bp = Blueprint("training_bp", __name__)

# CREATE or UPSERT TrainingData
@training_bp.route("/create", methods=["POST"])
@jwt_required()
@role_required(["admin", "superadmin"])
def create_training_data():
    try:
        # Get logged-in admin ID from JWT token
        admin_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role", "admin")

        data = request.get_json()
        domain = data.get("domain")
        questions = data.get("questions", [])

        if not domain:
            return make_response(msg="Domain is required", status_code=400)

        # Convert dicts to TrainingQuestion objects
        parsed_questions = [TrainingQuestion(**q) for q in questions]

        # ✅ Case-insensitive search for existing TrainingData
        training_data = None
        all_training = TrainingData.objects(admin=ObjectId(admin_id))
        for td in all_training:
            if td.domain.lower() == domain.lower():
                training_data = td
                break

        if training_data:
            # Append new questions without duplicates (by question text)
            existing_texts = {str(q.question).strip().lower() for q in training_data.questions}
            new_questions = [q for q in parsed_questions if str(q.question).strip().lower() not in existing_texts]
            training_data.questions.extend(new_questions)
            training_data.last_updated = datetime.datetime.utcnow()
        else:
            # Create new document with admin reference
            training_data = TrainingData(
                admin=admin_id,
                domain=domain,
                questions=parsed_questions,
                last_updated=datetime.datetime.utcnow()
            )

        training_data.save()

        # ✅ Update Setting.admin_skills
        setting = Setting.objects.first()
        if not setting:
            setting = Setting()

        if role == "admin":
            # Admin → update their own admin_skills
            admin_entry = next(
                (adm for adm in setting.admin_skills if str(adm.admin_id) == str(admin_id)),
                None
            )
            if not admin_entry:
                admin_entry = AdminSkillSet(
                    admin_id=admin_id,
                    skills=[SkillSetting(skill=domain, num_questions=len(training_data.questions))]
                )
                setting.admin_skills.append(admin_entry)
            else:
                existing_admin_skills = [s.skill.lower() for s in (admin_entry.skills or [])]
                if domain.lower() not in existing_admin_skills:
                    admin_entry.skills.append(SkillSetting(skill=domain, num_questions=len(training_data.questions)))

        setting.updated_at = datetime.datetime.utcnow()
        setting.save()

        return make_response(
            data=training_data.to_mongo().to_dict(),
            msg="Training data saved successfully",
            status_code=201
        )

    except ValidationError as e:
        return make_response(msg=f"Validation Error: {str(e)}", status_code=400)
    except Exception as e:
        return make_response(msg=f"Error saving training data: {str(e)}", status_code=500)


# READ with filters (by domain and/or tag)
@training_bp.route("/list", methods=["GET"])
@jwt_required()
@role_required(["admin", "superadmin"])
def list_training_data():
    try:
        # Extract user info from JWT
        claims = get_jwt()
        role = claims.get("role", "admin")
        admin_id = get_jwt_identity()
 
        # Query params
        domain = request.args.get("domain")
        tag = request.args.get("tag")

        # Base query
        query = TrainingData.objects

        # SuperAdmin can see all, Admin sees only their own data
        if role != "superadmin":
            query = query.filter(admin=admin_id)

        if domain:
            query = query.filter(domain=domain)

        query = query.order_by("-last_updated")

        # Build the response list
        training_data_list = []
        for td in query:
            if tag:
                filtered_questions = [q for q in td.questions if tag in q.tags]
            else:
                filtered_questions = td.questions

            training_data_list.append({
                "id": str(td.id),
                "domain": td.domain,
                "admin": str(td.admin.id) if td.admin else None,
                "last_updated": td.last_updated.isoformat(),
                "questions": [
                    {
                        "question": q.question,
                        "difficulty": q.difficulty,
                        "tags": q.tags
                    } for q in filtered_questions
                ]
            })

        return make_response(
            data=training_data_list,
            msg="Training data fetched successfully",
            status_code=200
        )

    except Exception as e:
        return make_response(msg=f"Error fetching training data: {str(e)}", status_code=500)


# GET single TrainingData by ID
@training_bp.route("/<string:training_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "superadmin"])
def get_training_data(training_id):
    try:
        claims = get_jwt()
        role = claims.get("role", "admin")
        admin_id = get_jwt_identity()

        # SuperAdmin can access any training data
        # Admin can access only their own
        if role == "superadmin":
            td = TrainingData.objects.get(id=training_id)
        else:
            td = TrainingData.objects.get(id=training_id, admin=admin_id)

        # Convert MongoEngine document to JSON-friendly dict
        td_data = {
            "id": str(td.id),
            "domain": td.domain,
            "admin": str(td.admin.id) if td.admin else None,
            "last_updated": td.last_updated.isoformat() if td.last_updated else None,
            "questions": [
                {
                    "question_id": q.question_id,
                    "question": q.question,
                    "difficulty": q.difficulty,
                    "tags": q.tags
                } for q in td.questions
            ]
        }

        return make_response(data=td_data, msg="Training data fetched successfully", status_code=200)

    except DoesNotExist:
        return make_response(msg="Training data not found or access denied", status_code=404)
    except Exception as e:
        return make_response(msg=f"Error fetching training data: {str(e)}", status_code=500)


# UPDATE questions in domain
@training_bp.route("/<string:training_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "superadmin"])
def update_training_data(training_id):
    try:
        claims = get_jwt()
        role = claims.get("role", "admin")
        admin_id = get_jwt_identity()
        data = request.get_json()

        # SuperAdmin → any record
        # Admin → only their own
        if role == "superadmin":
            td = TrainingData.objects.get(id=training_id)
        else:
            td = TrainingData.objects.get(id=training_id, admin=admin_id)

        # ✅ Update questions if provided
        if "questions" in data:
            td.questions = [TrainingQuestion(**q) for q in data["questions"]]
            td.last_updated = datetime.datetime.utcnow()

        # ✅ Update domain if provided
        if "domain" in data:
            td.domain = data["domain"]

        td.save()
        
        td_data = {
            "id": str(td.id),
            "domain": td.domain,
            "admin": str(td.admin.id) if td.admin else None,
            "last_updated": td.last_updated.isoformat() if td.last_updated else None,
            "questions": [
                {
                    "question_id": q.question_id,
                    "question": q.question,
                    "difficulty": q.difficulty,
                    "tags": q.tags
                } for q in td.questions
            ]
        }

        return make_response(
            data=td_data,
            msg="Training data updated successfully",
            status_code=200
        )

    except DoesNotExist:
        return make_response(
            msg="Training data not found or access denied",
            status_code=404
        )
    except Exception as e:
        return make_response(
            msg=f"Update failed: {str(e)}",
            status_code=400
        )



# DELETE by ID
@training_bp.route("/<string:training_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "superadmin"])
def delete_training_data(training_id):
    try:
        claims = get_jwt()
        role = claims.get("role", "admin")
        admin_id = get_jwt_identity()

        # SuperAdmin → can delete any record
        # Admin → can delete only their own
        if role == "superadmin":
            td = TrainingData.objects.get(id=training_id)
        else:
            td = TrainingData.objects.get(id=training_id, admin=admin_id)

        td.delete()

        return make_response(
            msg="Training data deleted successfully",
            status_code=200
        )

    except DoesNotExist:
        return make_response(
            msg="Training data not found or access denied",
            status_code=404
        )
    except Exception as e:
        return make_response(
            msg=f"Error deleting training data: {str(e)}",
            status_code=500
        )