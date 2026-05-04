from mongoengine import ReferenceField, DictField, BooleanField
from mongoengine import Document, StringField, ListField, DateTimeField, IntField, EmbeddedDocumentField, EmbeddedDocument, ObjectIdField, FloatField
import datetime
from bson import ObjectId
from dotenv import load_dotenv
import os
load_dotenv()

from models.userModel import User

class Resume(EmbeddedDocument):
    resume_id = ObjectIdField(default=ObjectId, required=True)  # unique ID for each resume
    file = StringField(required=True)   # Google Drive link or file path
    summary = StringField() 

class MockInterview(Document):
    user = ReferenceField(User, required=True)
    int_id = StringField(required=True, unique=True)
    title = StringField(required=True)
    skills = ListField(StringField())
    status = StringField(choices=["scheduled", "completed", "cancelled"], default="scheduled")
    link = StringField()
    resume = EmbeddedDocumentField(Resume)
    history = ListField(DictField())  # List of Q&A {question, answer, timestamp}
    topic_covered = IntField(default=0)
    feedback = StringField()
    score = IntField(default=0)
    room_id = StringField(required=True)
    cand_token = StringField(required=True)
    agent_voice = StringField(default="ash", choices=["ash", "ballad", "coral", "sage", "verse"])
    num_questions = IntField(default=10)
    credit_used = FloatField(default=float(os.getenv("INTERVIEW_COST")))  # amount of credit used for this interview
    # payment_status = StringField(default="deducted", choices=["deducted", "pending", "failed"])
    created_at = DateTimeField(default=datetime.datetime.utcnow)