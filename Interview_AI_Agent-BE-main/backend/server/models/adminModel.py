from mongoengine import EmbeddedDocument, EmbeddedDocumentField, StringField, BooleanField, DateTimeField, Document
from cryptography.fernet import Fernet
import os
import datetime
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

f = Fernet(os.getenv("ENCRYPTION_SECRET_KEY").encode()) 
# f = Fernet("V5NPEhjhCvLOfnIr64OPdrcZAgcpuTWQOGVgiSQPbbs".encode()) 

class MailSettings(EmbeddedDocument):
    html = StringField()
    subject = StringField()
    email_from = StringField()
    smtp_host = StringField()
    smtp_port = StringField()
    smtp_username = StringField()
    smtp_password_encrypted = StringField()   # encrypted only
    smtp_use_tls = BooleanField(default=True)
    smtp_use_ssl = BooleanField(default=False)

    def set_smtp_password(self, raw_password: str):
        self.smtp_password_encrypted = f.encrypt(raw_password.encode()).decode()

    def get_smtp_password(self) -> str:
        if not self.smtp_password_encrypted:
            return None
        return f.decrypt(self.smtp_password_encrypted.encode()).decode()


class Admin(Document):
    name = StringField(required=True)
    username = StringField(required=True, unique=True)
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    phone = StringField()
    role = StringField(default="admin")  # Future-proofing: "admin", "superadmin", etc.
    deleted = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    mail_settings = EmbeddedDocumentField(MailSettings)  # only new field

    # existing password logic stays same
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

