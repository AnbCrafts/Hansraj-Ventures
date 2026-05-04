from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from mongoengine import connect
from mongoengine.connection import get_connection
from dotenv import load_dotenv
from datetime import timedelta
import os
from flask_cors import CORS 

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Secure JWT secret
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

# print("KEY_ID:", os.getenv("RAZORPAY_KEY_ID"))
# print("KEY_SECRET:", os.getenv("RAZORPAY_KEY_SECRET"))

# Connect to MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/InterviewAI')
connect(db='InterviewAI', host=MONGO_URI)

# Register blueprints
from routes.adminRoutes import admin_bp 
from routes.candidateRoutes import candidate_bp
from routes.interviewRoutes import interview_bp
from routes.trainingRoutes import training_bp
from routes.userRoutes import user_bp
from routes.mockInterviewRoutes import mock_interview_bp
from routes.superAdminRoutes import super_admin_bp

app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(candidate_bp, url_prefix='/api/candidate')
app.register_blueprint(interview_bp, url_prefix='/api/interview')
app.register_blueprint(training_bp, url_prefix='/api/training')
app.register_blueprint(mock_interview_bp, url_prefix='/api/mockInterview')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(super_admin_bp, url_prefix='/api/superAdmin')

@app.route('/api/health')
def index():
    return jsonify({'message': 'Backend Running at 29 November 2025!'}), 200

@app.route('/api/mongo-status')
def mongo_status():
    try:
        conn = get_connection()
        # Force a command to verify actual connectivity
        conn.admin.command('ping')
        return jsonify({
            'status': 'connected',
            'mongo_uri': MONGO_URI
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'disconnected',
            'error': str(e)
        }), 500
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5055, use_reloader=False)
