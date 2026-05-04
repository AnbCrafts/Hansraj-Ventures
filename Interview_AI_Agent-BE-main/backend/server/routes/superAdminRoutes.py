import datetime
from datetime import timedelta
from flask import Blueprint, request, jsonify
from models.adminModel import Admin, MailSettings
from models.interviewModel import Interview
from models.userModel import User
from models.paymentModel import Payment
from utils.agentToken import role_required
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from utils.response import make_response

super_admin_bp = Blueprint('super_admin_bp', __name__)

# @jwt_required()
# @role_required(["superadmin"])
    # current_admin_id = get_jwt_identity()
    # current_admin = Admin.objects(id=current_admin_id).first()

    # if not current_admin:
    #     return jsonify({"msg": "Unauthorized"}), 403
@super_admin_bp.route('/add', methods=['POST'])
def add_admin():
   
    data = request.json or {}
    required_fields = ["name", "username", "email", "password"]

    # ✅ Check required fields
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"{field} is required"}), 400

    try:
        # ✅ Check if email/username already exists
        if Admin.objects(username=data["username"]).first():
            return jsonify({"msg": "Username already taken"}), 409
        if Admin.objects(email=data["email"]).first():
            return jsonify({"msg": "Email already registered"}), 409

        # ✅ Create new admin
        new_admin = Admin(
            name=data["name"],
            username=data["username"],
            email=data["email"],
            phone=data.get("phone", ""),
            role=data.get("role", "admin"),
        )
        new_admin.set_password(data["password"])
        new_admin.save()

        return jsonify({
            "msg": "New admin created successfully",
            "data": {
                "id": str(new_admin.id),
                "name": new_admin.name,
                "username": new_admin.username,
                "email": new_admin.email,
                "phone": new_admin.phone,
                "role": new_admin.role,
                "created_at": new_admin.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        return jsonify({"msg": str(e)}), 500


@super_admin_bp.route('/restore/<admin_id>', methods=['PUT'])
@jwt_required()
@role_required(["superadmin"])
def restore_admin(admin_id):
    admin = Admin.objects(id=admin_id).first()
    if not admin:
        return jsonify({"msg": "Admin not found"}), 404
    
    admin.update(set__deleted=False)
    return make_response(data=admin.to_mongo(), msg="Admin restored successfully", status_code=200)


@super_admin_bp.route('/<admin_id>', methods=['DELETE'])
@jwt_required()
@role_required(["superadmin"])
def delete_admin(admin_id):
    admin = Admin.objects(id=admin_id).first()
    if not admin:
        return jsonify({"msg": "Admin not found"}), 404
    
    admin.update(set__deleted=True)
    return jsonify({"msg": "Admin marked as deleted"}), 200


@super_admin_bp.route("/dashboard/overview", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_overview():
    total_admins = Admin.objects(deleted=False).count()
    total_deleted_admins = Admin.objects(deleted=True).count()
    total_interviews = Interview.objects.count()
    
    status_counts = {
        "scheduled": Interview.objects(status="scheduled").count(),
        "in_progress": Interview.objects(status="in_progress").count(),
        "completed": Interview.objects(status="completed").count(),
        "cancelled": Interview.objects(status="cancelled").count()
    }

    # model_type_counts = {
    #     mt: Interview.objects(model_type=mt).count()
    #     for mt in ["OpenAI", "Claude", "Gemini", "LocalLLM"]
    # }

    voices = ["ash", "ballad", "coral", "sage", "verse"]
    voice_counts = {
        v: Interview.objects(agent_voice=v).count()
        for v in voices
    }
    # Find the most used voice
    most_used_voice = max(voice_counts, key=voice_counts.get) if voice_counts else None

    return make_response(data={
        "admins": {
            "total": total_admins,
            "deleted": total_deleted_admins,
        },
        "interviews": {
            "total": total_interviews,
            "status_distribution": status_counts,
            # "model_distribution": model_type_counts,
        },
        "agent_voices": {
            "distribution": voice_counts,
            "most_used": most_used_voice,
            "most_used_count": voice_counts.get(most_used_voice, 0) if most_used_voice else 0
        }
    }, msg="Training data saved successfully",status_code=201)


@super_admin_bp.route("/admins", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_admins():
    # Get pagination params from query string
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    # Calculate skip offset
    skip = (page - 1) * limit

    # Query only non-deleted admins
    total_admins = Admin.objects(deleted=False).count()
    admins = Admin.objects(deleted=False).order_by("-created_at").skip(skip).limit(limit)

    data = [{
        "id": str(a.id),
        "name": a.name,
        "email": a.email,
        "username": a.username,
        "role": a.role,
        "created_at": a.created_at.isoformat()
    } for a in admins]

    pagination_info = {
        "current_page": page,
        "limit": limit,
        "total_records": total_admins,
        "total_pages": (total_admins + limit - 1) // limit,  # ceiling division
        "has_next": (page * limit) < total_admins,
        "has_prev": page > 1
    }

    return make_response(
        data={"admins": data, "pagination_info": pagination_info},
        msg="Admins fetched successfully",
        status_code=200
    )   

@super_admin_bp.route("/deleted-admins", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_deleted_admins():
    # Get pagination params from query string
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    # Calculate skip offset
    skip = (page - 1) * limit

    # Query only non-deleted admins
    total_admins = Admin.objects(deleted=True).count()
    admins = Admin.objects(deleted=True).order_by("-created_at").skip(skip).limit(limit)

    data = [{
        "id": str(a.id),
        "name": a.name,
        "email": a.email,
        "username": a.username,
        "role": a.role,
        "created_at": a.created_at.isoformat()
    } for a in admins]

    pagination_info = {
        "current_page": page,
        "limit": limit,
        "total_records": total_admins,
        "total_pages": (total_admins + limit - 1) // limit,  # ceiling division
        "has_next": (page * limit) < total_admins,
        "has_prev": page > 1
    }

    return make_response(
        data={"admins": data, "pagination_info": pagination_info},
        msg="Admins fetched successfully",
        status_code=200
    )   


@super_admin_bp.route("/reset", methods=["POST"])
@jwt_required()
@role_required(["superadmin", "admin"])
def reset_email_settings():
    try:
        admin_id = get_jwt_identity()
        admin = Admin.objects(id=admin_id).first()

        if not admin:
            return make_response(msg="Admin not found", status_code=404)

        # Default subject and HTML template
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

        # Ensure mail_settings exists
        if not admin.mail_settings:
            admin.mail_settings = MailSettings()

        # Reset values
        admin.mail_settings.subject = default_subject
        admin.mail_settings.html = default_html
        admin.mail_settings.updated_at = datetime.datetime.utcnow()

        admin.save()
        return make_response(
            data={"subject": admin.mail_settings.subject, "html": admin.mail_settings.html},
            msg="Email template and subject reset to default successfully.",
            status_code=200,
        )

    except Exception as e:
        return make_response(msg=f"Error resetting settings: {str(e)}", status_code=500)



@super_admin_bp.route("/dashboard/admin-interviews", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_admin_interview_stats():
    admins = Admin.objects(deleted=False)
    result = []

    for admin in admins:
        interviews = Interview.objects(admin=admin)
        count_by_status = {
            "scheduled": interviews(status="scheduled").count(),
            "in_progress": interviews(status="in_progress").count(),
            "completed": interviews(status="completed").count(),
            "cancelled": interviews(status="cancelled").count(),
        }
        result.append({
            "admin_name": admin.name,
            "admin_id": str(admin.id),
            "total_interviews": interviews.count(),
            "status_distribution": count_by_status,
        })
    return make_response(data=result, msg="Admin interviews fetched successfully", status_code=200)


@super_admin_bp.route("/dashboard/recent-interviews", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_recent_interviews():
    interviews = Interview.objects.order_by("-created_at")[:20]
    data = []

    for i in interviews:
        candidate_name = None
        candidate_id = None
        try:
            # Safely dereference candidate
            if i.candidate:
                candidate_name = getattr(i.candidate, "name", None)
                candidate_id = str(i.candidate.id)
        except Exception:
            # Candidate might not exist anymore
            candidate_name = "Deleted Candidate"
            candidate_id = None

        admin_name = None
        try:
            if i.admin:
                admin_name = getattr(i.admin, "name", None)
        except Exception:
            admin_name = "Deleted Admin"

        data.append({
            "int_id": i.int_id,
            "title": i.title,
            "status": i.status,
            "admin": admin_name,
            "candidate": candidate_id,
            "candidate_name": candidate_name,
            "score": i.score,
            "agent_voice": getattr(i, "agent_voice", None),
            "selected": i.selected,
            "created_at": i.created_at.isoformat(),
        })

    return make_response(data=data, msg="Recent interviews fetched successfully", status_code=200)


@super_admin_bp.route("/dashboard/interview-trends", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_interview_trends():
    days = int(request.args.get("days", 7))  # default 7 days
    today = datetime.utcnow()
    start_date = today - datetime.timedelta(days=days)

    pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]

    results = list(Interview._get_collection().aggregate(pipeline))
    data = [{"date": r["_id"], "count": r["count"]} for r in results]

    return make_response(data=data, msg="Interview trends fetched successfully", status_code=200)


@super_admin_bp.route("/stats/overview", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_overview_stats():
    total_users = User.objects.count()
    total_payments = Payment.objects.count()
    total_revenue = sum(p.amount for p in Payment.objects(status="paid"))
    total_failed = Payment.objects(status="failed").count()
    # total_pending = Payment.objects(status="created").count()

    avg_revenue_per_user = round(total_revenue / total_users, 2) if total_users else 0

    stats = {
        "total_users": total_users,
        "total_payments": total_payments,
        "total_revenue": total_revenue,
        "average_revenue_per_user": avg_revenue_per_user,
        "failed_transactions": total_failed,
        # "pending_transactions": total_pending,
    }
    return make_response(data=stats, msg="Stats fetched successfully", status_code=200)


@super_admin_bp.route("/stats/revenue-trend", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def revenue_trend():
    today = datetime.datetime.utcnow()
    start_date = today - timedelta(days=30)

    payments = Payment.objects(status="paid", created_at__gte=start_date).order_by("created_at")

    revenue_per_day = {}
    for p in payments:
        day = p.created_at.strftime("%Y-%m-%d")
        revenue_per_day[day] = revenue_per_day.get(day, 0) + p.amount

    trend = [{"date": day, "revenue": round(amount, 2)} for day, amount in revenue_per_day.items()]
    return make_response(data=trend, msg="Revenue trend fetched successfully", status_code=200)

@super_admin_bp.route("/stats/top-users", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def top_users():
    users = User.objects.order_by("-total_spent")[:20]
    top_users_data = [
        {
            "name": u.name,
            "email": u.email,
            "total_spent": u.total_spent,
            "credits": u.credits,
            "created_at": u.created_at.strftime("%Y-%m-%d"),
        }
        for u in users
    ]

    return make_response(data=top_users_data, msg="Top users fetched successfully", status_code=200)

@super_admin_bp.route("/stats/payment-status", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def payment_status_summary():
    statuses = ["created", "paid", "failed", "refunded"]
    counts = {s: Payment.objects(status=s).count() for s in statuses}
    return make_response(data=counts, msg="Payment status summary fetched successfully", status_code=200)

@super_admin_bp.route("/stats/user-recent", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def recent_users():

    try:
        # Pagination setup
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))

        # Date range setup
        start_date_str = request.args.get("start_date")
        end_date_str = request.args.get("end_date")

        if start_date_str and end_date_str:
            start_date = datetime.datetime.fromisoformat(start_date_str)
            end_date = datetime.datetime.fromisoformat(end_date_str) + timedelta(days=1)
        else:
            end_date = datetime.datetime.utcnow()
            start_date = end_date - timedelta(days=30)

        # Filter users by created_at
        query = User.objects(created_at__gte=start_date, created_at__lte=end_date).order_by("-created_at")

        total_users = query.count()
        users_paginated = query.skip((page - 1) * limit).limit(limit)

        users_data = [
            {
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "credits": u.credits,
                "total_spent": u.total_spent,
            }
            for u in users_paginated
        ]

        return jsonify({
            "success": True,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_users,
                "total_pages": (total_users + limit - 1) // limit,
            },
            "data": users_data
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@super_admin_bp.route("/recent_payments", methods=["GET"])
@jwt_required()
@role_required(["superadmin"])
def get_recent_payments():
    try:
        # Pagination params
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        status_filter = request.args.get("status", "paid")  # default to 'paid' payments
        skip = (page - 1) * limit

        # Query paid payments
        total_payments = Payment.objects(status="paid").count()
        payments = (
            Payment.objects(status=status_filter)
            .order_by("-created_at")
            .skip(skip)
            .limit(limit)
        )

        # Build response data
        data = []
        for p in payments:
            user = p.user  # ReferenceField(User)
            data.append({
                "id": str(p.id),
                "user": {
                    "id": str(user.id) if user else None,
                    "name": user.name if hasattr(user, "name") else None,
                    "email": user.email if hasattr(user, "email") else None,
                },
                "razorpay_order_id": p.razorpay_order_id,
                "razorpay_payment_id": p.razorpay_payment_id,
                "amount": p.amount,
                "currency": p.currency,
                "status": p.status,
                "created_at": p.created_at.isoformat(),
                "updated_at": p.updated_at.isoformat(),
            })

        # Pagination info
        pagination_info = {
            "current_page": page,
            "limit": limit,
            "total_records": total_payments,
            "total_pages": (total_payments + limit - 1) // limit,
            "has_next": (page * limit) < total_payments,
            "has_prev": page > 1
        }

        return make_response(
            data={"payments": data, "pagination_info": pagination_info},
            msg="Recent paid payments fetched successfully",
            status_code=200
        )

    except Exception as e:
        return make_response(
            msg=f"Error fetching recent payments: {str(e)}",
            status_code=500
        )
