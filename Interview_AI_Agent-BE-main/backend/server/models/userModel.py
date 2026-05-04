from mongoengine import Document, StringField, DateTimeField, ListField, EmbeddedDocument, EmbeddedDocumentField, ObjectIdField, FloatField, ReferenceField
from bson import ObjectId
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
load_dotenv()


class Resume(EmbeddedDocument):
    resume_id = ObjectIdField(default=ObjectId, required=True)  # unique ID for each resume
    file = StringField(required=True)   # Google Drive link or file path
    summary = StringField() 

class User(Document):
    email = StringField(required=True, unique=True)
    name = StringField(required=True)
    phone = StringField()
    resumes = ListField(EmbeddedDocumentField(Resume))
    skills = ListField(StringField())
    password = StringField(required=True)
    credits = FloatField(default=1.0)  # $ credits user currently has
    total_spent = FloatField(default=0.0)  # total $ spent
    payment_history = ListField(ReferenceField('Payment'))  # references to Payment documents
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def can_start_interview(self):
        """Check if user has enough credits (0.5 per interview)."""
        return self.credits >= float(os.getenv("INTERVIEW_COST"))

    def deduct_credit(self, amount=float(os.getenv("INTERVIEW_COST"))):
        """Deduct credits when an interview starts."""
        if self.credits >= amount:
            self.credits -= amount
            self.save()
            return True
        return False
