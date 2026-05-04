import datetime, random, fitz, re, razorpay, os, uuid 
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from mongoengine.errors import DoesNotExist, ValidationError
from openai import OpenAI
from groq import Groq

from models.userModel import User, Resume
from models.otpModel import OTP
from models.settingModel import Setting
from models.mockInterviewModel import MockInterview
from models.paymentModel import Payment

from utils.email import send_email
from utils.response import make_response
from utils.imageUpload import delete_from_drive, upload_ss_drive
from utils.generateID import generate_unique_id
from utils.paymentsHelper import usd_to_inr_paise, razorpay_client

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/request_otp', methods=['POST'])
def request_otp():
    data = request.get_json()
    email = data.get("email")
    reason = data.get("reason", "signup")  # "signup" or "forgot"

    if not email :
        return jsonify({"msg": "Email is required"}), 400

    if reason == "signup" :
        if User.objects(email=email).first():
            return jsonify({"msg": "Email already exists"}), 400

    otp_code = str(random.randint(100000, 999999))

    # Replace or create new OTP record
    otp_doc = OTP.objects(email=email).first()
    if otp_doc:
        otp_doc.otp = otp_code
        otp_doc.created_at = datetime.datetime.utcnow()
    else:
        otp_doc = OTP(email=email, otp=otp_code)
    otp_doc.save()

    # Send OTP via email
    subject = "Your OTP Code"
    html_message = f"<p>Your OTP code is: <b>{otp_code}</b></p>"
    
    return_message = "OTP sent successfully"
    try:
        send_email(None, subject, html_message, email, None)
    except Exception as e:
        return_message = f"Failed to send email: {str(e)}"

    return make_response(msg=return_message, data={"email": email, "otp": otp_code}, status_code=200)

@user_bp.route('/register', methods=['POST'])
def register_admin():
    data = request.get_json()
    email = data.get("email")
    otp_code = data.get("otp")
    name = data.get("name")

    if not email or not otp_code:
        return jsonify({"msg": "Email and OTP are required"}), 400

    # Verify OTP
    otp_doc = OTP.objects(email=email, otp=otp_code).first()
    if not otp_doc:
        return jsonify({"msg": "Invalid or expired OTP"}), 400

    if User.objects(email=email).first():
        return jsonify({"msg": "Email already exists"}), 400

    # Create user
    user = User(email=email)
    user.name = name
    user.set_password(data['password'])
    user.save()

    # Delete OTP after success
    otp_doc.delete()

    return make_response(data={"token": create_access_token(identity=str(user.id)), "user" : user}, msg="Registration successful", status_code=200)

@user_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()

    email = data.get("email")
    otp_code = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp_code or not new_password:
        return make_response(
            msg="Email, OTP and new_password are required",
            status_code=400
        )

    # Validate user exists
    user = User.objects(email=email).first()
    if not user:
        return make_response(msg="User not found", status_code=404)

    # Validate OTP
    otp_doc = OTP.objects(email=email, otp=otp_code).first()
    if not otp_doc:
        return make_response(
            msg="Invalid or expired OTP",
            status_code=400
        )

    # Prevent using old password
    if user.check_password(new_password):
        return make_response(
            msg="You cannot reuse your previous password.",
            status_code=400
        )

    # Update user password
    user.set_password(new_password)
    user.save()

    # Delete OTP after success
    otp_doc.delete()

    return make_response(
        msg="Password reset successful",
        data={"email": email},
        status_code=200
    )


# Login user
@user_bp.route('/login', methods=['POST'])
def login_admin():
    data = request.get_json()
    user = User.objects(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401
    access_token = create_access_token(identity=str(user.id))

    # Convert user to dict
    user_dict = user.to_mongo().to_dict()
    user_dict['id'] = str(user.id)
    
    # Clean unwanted keys
    for key in ['password', '_id', 'payment_history']:
        user_dict.pop(key, None)

    # Optionally serialize resumes
    user_dict['resumes'] = [serialize_resume(r) for r in user.resumes]

    return make_response(
        data={"token": access_token, "user": user_dict},
        msg="Login successful",
        status_code=200
    )
    
def serialize_resume(resume: Resume) -> dict:
    return {
        "resume_id": str(resume.resume_id),  # ✅ expose as string
        "file": resume.file,
        "summary": resume.summary
    }

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    admin_id = get_jwt_identity()
    user = User.objects(id=admin_id).first()

    if not user:
        return jsonify({"msg": "User not found"}), 404
    data = {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "skills": user.skills,
        "resumes": [serialize_resume(r) for r in user.resumes],
        "created_at": user.created_at.isoformat() if user.created_at else None
    }
    return make_response(data=data, msg="Profile fetched successfully", status_code=200)


@user_bp.route("/update", methods=["PATCH"])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    data = request.json or {}

    try:
        # ✅ Fetch logged-in user
        user = User.objects.get(id=user_id)

        if "phone" in data and data["phone"]:
            user.phone = data["phone"]

        if "name" in data and data["name"]:
            user.name = data["name"]

        if "skills" in data and data["skills"]:
            user.skills = data["skills"]

        # ✅ Update password (only if new one provided)
        if "password" in data and data["password"]:
            new_password = data["password"]
            old_password = data.get("old_password", "")
            
            if not old_password:
                return make_response(
                    msg="Old password is required to update account details",
                    status_code=400,
                )

            # ✅ Verify old password
            if not user.check_password(old_password):
                return make_response(
                    msg="Old password is incorrect",
                    status_code=401,
                )

            if user.check_password(new_password):
                return make_response(
                    msg="You cannot reuse your previous password.",
                    status_code=400,
                )
            user.set_password(data["password"])  # assumes hashing logic inside

        user.save()

        return make_response(
            data={
                "id": str(user.id),
                "email": getattr(user, "email", None),
                "phone": getattr(user, "phone", None),
                "name": getattr(user, "name", None),
                "created_at": user.created_at.isoformat(),
            },
            msg="User account updated successfully",
            status_code=200,
        )

    except DoesNotExist:
        return make_response(msg="User not found", status_code=404)
    except (ValidationError, Exception) as e:
        return make_response(msg=str(e), status_code=400)
    

@user_bp.route("/add_resume", methods=["POST"])
@jwt_required()
def add_resume():
    try:
        current_user_id = get_jwt_identity() 
        setting = Setting.objects.first()
        # openai_client = OpenAI(api_key=setting.openai_api_key)
        groq_ai_client = Groq(api_key=(setting.groq_api_key or os.environ.get("GROQ_API_KEY"))) 

        user = User.objects(id=current_user_id).first()
        if not user:
            return make_response(msg="User not found", status_code=404)

        resume_file = request.files.get("resume")
        if not resume_file or not resume_file.filename.endswith(".pdf"):
            return make_response(msg="Resume must be a PDF file", status_code=400)

        # read file
        file_bytes = resume_file.read()

        # parse resume text
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            raw_text = ""
            for page in doc:
                raw_text += page.get_text()

        # generate professional summary with OpenAI
        groq_ai_response = groq_ai_client.chat.completions.create(
            model = "llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an assistant that writes detailed but concise "
                        "professional summaries from resumes. The summary should be suitable "
                        "for interviews and highlight core strengths. Do NOT include phrases like "
                        "'Here is the summary' and do NOT use emojis."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Here is the extracted resume content:\n\n{raw_text}\n\nWrite a professional profile summary.",
                },
            ],
            temperature=0.7,
        )
        profile_summary = groq_ai_response.choices[0].message.content.strip()

        # upload file to storage (your drive uploader)
        user_id = str(user.id)
        resume_id = generate_unique_id("resume")
        mime_type = resume_file.content_type or "application/pdf"
        uploaded_link = upload_ss_drive(
            file_bytes,
            f"U-{user_id}",
            "resume",
            f"{user.name}_{resume_id}_resume.pdf",
            mime_type,
        )

        # append new resume + summary
        new_resume = Resume(file=uploaded_link, summary=profile_summary)
        user.resumes.append(new_resume)
        user.updated_at = datetime.datetime.utcnow()
        user.save()

        return make_response(
            data={"file": uploaded_link, "summary": profile_summary, "resume_id": str(new_resume.resume_id)},
            msg="Resume added successfully",
            status_code=201,
        )

    except ValidationError as e:
        return make_response(msg=str(e), status_code=400)
    except Exception as e:
        return make_response(msg="Error while adding resume: " + str(e), status_code=500)

@user_bp.route("/delete_resume", methods=["DELETE"])
@jwt_required()
def delete_resume():
    try:
        current_user_id = get_jwt_identity()
        user = User.objects(id=current_user_id).first()
        if not user:
            return make_response(msg="User not found", status_code=404)

        resume_id = request.args.get("resume_id")
        if not resume_id:
            return make_response(msg="resume_id is required", status_code=400)

        # Find the resume
        resume = next((r for r in user.resumes if str(r.resume_id) == resume_id), None)
        if not resume:
            return make_response(msg="Resume not found", status_code=404)

        # Extract file_id from Google Drive link
        match = re.search(r"/d/([^/]+)/view", resume.file)
        if not match:
            return make_response(msg="Invalid Google Drive link format", status_code=400)
        file_id = match.group(1)

        if not delete_from_drive(file_id): 
            return make_response(msg="Failed to delete resume from Google Drive", status_code=500)


        # Remove resume from user
        user.resumes = [r for r in user.resumes if str(r.resume_id) != resume_id]
        user.save()

        return make_response(msg="Resume deleted successfully", status_code=200)

    except Exception as e:
        return make_response(msg="Error while deleting resume: " + str(e), status_code=500)
    
    

@user_bp.route("/dashboard/summary", methods=["GET"])
@jwt_required()
def user_dashboard_summary():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return make_response(msg="User not found", status_code=404)

        # --- Interview Stats ---
        interviews = MockInterview.objects(user=user)
        total_interviews = interviews.count()
        avg_score = 0
        last_interview = None
        voice_count = {}

        if total_interviews > 0:
            scores = []
            for i in interviews:
                scores.append(i.score or 0)
                voice_count[i.agent_voice] = voice_count.get(i.agent_voice, 0) + 1

            avg_score = round(sum(scores) / len(scores), 2)
            last_interview = max(interviews, key=lambda x: x.created_at).created_at

        most_used_voice = max(voice_count, key=voice_count.get) if voice_count else None

        # --- Financial Stats ---
        payments = Payment.objects(user=user, status="paid")
        total_invested = round(sum(p.amount for p in payments), 2)  # total $ paid till now
        remaining_balance = round(user.credits, 2)  # user’s current available balance

        # --- Data Response ---
        data = {
            "user_name": user.name,
            "total_interviews": total_interviews,
            "average_score": avg_score,
            "most_used_agent_voice": most_used_voice,
            "last_interview_date": last_interview.isoformat() if last_interview else None,
            "total_resumes_uploaded": len(user.resumes),
            "total_invested_usd": total_invested,
            "remaining_balance_usd": remaining_balance
        }

        return make_response(data=data, msg="Dashboard summary fetched successfully", status_code=200)

    except Exception as e:
        return make_response(msg=f"Error fetching dashboard summary: {str(e)}", status_code=500)


@user_bp.route("/dashboard/skill-stats", methods=["GET"])
@jwt_required()
def user_skill_stats():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return make_response(msg="User not found", status_code=404)

        interviews = MockInterview.objects(user=user)
        skill_stats = {}

        for i in interviews:
            for skill in i.skills:
                if skill not in skill_stats:
                    skill_stats[skill] = {"count": 0, "total_score": 0}
                skill_stats[skill]["count"] += 1
                skill_stats[skill]["total_score"] += i.score or 0

        final = []
        for skill, val in skill_stats.items():
            avg_score = round(val["total_score"] / val["count"], 2)
            final.append({
                "skill": skill,
                "interview_count": val["count"],
                "average_score": avg_score
            })

        return make_response(data={"skill_stats": final}, msg="Skill stats fetched successfully", status_code=200)

    except Exception as e:
        return make_response(msg=f"Error fetching skill stats: {str(e)}", status_code=500)


@user_bp.route("/dashboard/resumes", methods=["GET"])
@jwt_required()
def user_resumes():
    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return make_response(msg="User not found", status_code=404)

        resumes = [{
            "resume_id": str(r.resume_id),
            "file": r.file,
            "summary": r.summary
        } for r in user.resumes]

        return make_response(data={"resumes": resumes}, msg="Resumes fetched successfully", status_code=200)

    except Exception as e:
        return make_response(msg=f"Error fetching resumes: {str(e)}", status_code=500)



@user_bp.route("/create-order", methods=["POST"])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = float(data.get("amount", 0))  # in USD (our internal value)

    if amount <= 0:
        return make_response(msg="Invalid amount", status_code=400)

    # Razorpay needs amount in paise (INR). Let's assume USD → INR manually (temporary)
    # In production, you’d handle currency conversion properly via Razorpay’s multi-currency feature
    amount_in_paise = usd_to_inr_paise(amount)

    user = User.objects.get(id=user_id)

    # Create Razorpay order
    order_data = {
        # "name": user.name,
        "amount": amount_in_paise,  # amount in paise
        "currency": "INR",
        "receipt": f"order_rcptid_{uuid.uuid4().hex[:8]}",
        # "order_id": f"order_{uuid.uuid4().hex[:8]}",
        "payment_capture": 1,
        "partial_payment":False,
        # "callback_url": "/verify",
        "notes": {
            "user_id": str(user.id),
            "user_name": user.name
        }
    }
    order = razorpay_client.order.create(order_data)
    print(order)
    # Save a Payment record (status=created)
    payment = Payment(
        user=user,
        razorpay_order_id=order["id"],
        amount=amount,
        currency="USD",
        status="created"
    )
    payment.save()

    return make_response(data={"order": order, "key": os.getenv("RAZORPAY_KEY_ID")}, msg="Order created", status_code=201)


@user_bp.route("/verify-payment", methods=["POST"])
@jwt_required()
def verify_payment():
    user_id = get_jwt_identity()
    data = request.get_json()

    order_id = data.get("razorpay_order_id")
    payment_id = data.get("razorpay_payment_id")
    signature = data.get("razorpay_signature")

    try:
        # Verify signature
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        payment = Payment.objects.get(razorpay_order_id=order_id)
        payment.mark_paid(payment_id, signature)

        return make_response(msg="Payment verified and credits added!", status_code=200)

    except razorpay.errors.SignatureVerificationError:
        return make_response(msg="Payment verification failed", status_code=400)


@user_bp.route("/dashboard/transactions", methods=["GET"])
@jwt_required()
def user_transaction_history():

    try:
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user:
            return make_response(msg="User not found", status_code=404)

        # --- Query Parameters ---
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        status = request.args.get("status")  # optional: "paid", "failed", etc.
        start_date_str = request.args.get("start_date")
        end_date_str = request.args.get("end_date")

        # --- Base Query ---
        query = {"user": user}

        if status:
            query["status"] = status

        # --- Date Range Filtering ---
        if start_date_str and end_date_str:
            try:
                start_date = datetime.datetime.fromisoformat(start_date_str)
                end_date = datetime.datetime.fromisoformat(end_date_str)
                query["created_at__gte"] = start_date
                query["created_at__lte"] = end_date
            except ValueError:
                return make_response(msg="Invalid date format. Use ISO format: YYYY-MM-DDTHH:MM:SS", status_code=400)

        # --- Fetch Paginated Payments ---
        total_payments = Payment.objects(**query).count()
        payments = (
            Payment.objects(**query)
            .order_by("-created_at")
            .skip((page - 1) * limit)
            .limit(limit)
        )

        # --- Prepare Response Data ---
        transactions = []
        for p in payments:
            transactions.append({
                "order_id": p.razorpay_order_id,
                "payment_id": p.razorpay_payment_id,
                "signature": p.razorpay_signature,
                "amount_usd": round(p.amount, 2),
                "currency": p.currency,
                "status": p.status,
                "created_at": p.created_at.isoformat(),
                "updated_at": p.updated_at.isoformat(),
            })

        data = {
            "total_transactions": total_payments,
            "page": page,
            "limit": limit,
            "transactions": transactions
        }

        return make_response(data=data, msg="Transaction history fetched successfully", status_code=200)

    except Exception as e:
        return make_response(msg=f"Error fetching transaction history: {str(e)}", status_code=500)
