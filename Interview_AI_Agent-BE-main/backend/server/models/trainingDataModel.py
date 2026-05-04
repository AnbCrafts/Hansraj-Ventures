from mongoengine import Document, StringField, ListField, DateTimeField, EmbeddedDocument, EmbeddedDocumentField, ReferenceField
import datetime, uuid
from models.adminModel import Admin

class TrainingQuestion(EmbeddedDocument):
    question_id = StringField(default=lambda: str(uuid.uuid4()), required=True) 
    question = StringField(required=True)
    difficulty = StringField(choices=["easy", "medium", "hard"])
    tags = ListField(StringField())

class TrainingData(Document):
    admin = ReferenceField(Admin, required=True)
    domain = StringField(required=True)  # "Backend", "Frontend", "ML"
    questions = ListField(EmbeddedDocumentField(TrainingQuestion))
    last_updated = DateTimeField(default=datetime.datetime.utcnow)
