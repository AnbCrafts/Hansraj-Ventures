from mongoengine import Document, StringField, ListField, DateTimeField, BooleanField, ReferenceField
import datetime
from models.adminModel import Admin

class Candidate(Document):
    name = StringField(required=True)
    cand_id = StringField(required=True, unique=True)
    email = StringField(required=True)
    phone = StringField()
    resume_url = StringField()  # stored on S3 or Drive
    skills = ListField(StringField())
    profile_summary = StringField()
    admin = ReferenceField(Admin, required=True)
    deleted = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
