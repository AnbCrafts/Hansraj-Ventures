from mongoengine import Document, StringField, ListField, DateTimeField, EmbeddedDocument, IntField, EmbeddedDocumentField
import datetime

class SkillSetting(EmbeddedDocument):
    skill = StringField(required=True)
    num_questions = IntField(default=0)
 
# Represents all skills of one admin
class AdminSkillSet(EmbeddedDocument):
    admin_id = StringField()  # Reference or ID of the admin
    skills = ListField(EmbeddedDocumentField(SkillSetting))  # Each admin has multiple skills

# Main Settings document
class Setting(Document): 
    email = StringField()
    password = StringField()
    html = StringField()
    subject = StringField()
    openai_api_key = StringField()
    groq_api_key = StringField()
    gemini_api_key = StringField()
    max_ques_limit = IntField()
    master_key = StringField()
    admin_skills = ListField(EmbeddedDocumentField(AdminSkillSet))  # Skills grouped per admin
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)