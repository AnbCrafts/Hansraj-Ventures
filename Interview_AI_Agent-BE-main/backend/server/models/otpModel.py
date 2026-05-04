from mongoengine import Document, StringField, DateTimeField
import datetime

class OTP(Document):
    email = StringField(required=True, unique=True)
    otp = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "indexes": [
            {"fields": ["created_at"], "expireAfterSeconds": 300}  # auto-delete after 5 min
        ]
    }
