from functools import wraps
from flask import request, abort, jsonify
import os
from dotenv import load_dotenv
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from models.adminModel import Admin

load_dotenv()

def require_agent_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if token != f"Bearer {os.getenv('AGENT_TOKEN')}":
            abort(401, description="Unauthorized access")
        return f(*args, **kwargs)
    return decorated


def role_required(required_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            user_id = claims.get("sub")  # by default JWT identity is stored under "sub"

            # ✅ Check role permission first
            if user_role not in required_roles:
                return jsonify({"msg": "Access denied: insufficient role"}), 403

            try:
                admin = Admin.objects.get(id=user_id)
                if getattr(admin, "deleted", False):
                    return jsonify({"msg": "Account deactivated"}), 403
            except Exception:
                return jsonify({"msg": "Invalid or missing admin account"}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper

