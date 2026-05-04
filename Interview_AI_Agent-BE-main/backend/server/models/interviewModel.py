from mongoengine import ReferenceField, DictField, BooleanField
from mongoengine import Document, StringField, ListField, DateTimeField, IntField, EmbeddedDocumentField
import datetime
from models.candidateModel import Candidate
from models.trainingDataModel import TrainingQuestion
from models.adminModel import Admin

class Interview(Document):
    candidate = ReferenceField(Candidate, required=True)
    admin = ReferenceField(Admin)
    int_id = StringField(required=True, unique=True)
    status = StringField(choices=["scheduled", "in_progress", "completed", "cancelled"], default="scheduled")
    model_type = StringField(choices=["OpenAI", "Claude", "Gemini", "LocalLLM","Groq"], default="Groq") 
    scheduled_time = DateTimeField()
    title = StringField(required=True)
    link = StringField()
    history = ListField(DictField())  # List of Q&A {question, answer, timestamp}
    feedback = StringField()
    selected = BooleanField(default=False)
    topic_covered = IntField(default=0)
    score = IntField(default=0)
    room_id = StringField(required=True)
    cand_token = StringField(required=True)
    agent_voice = StringField(default="ash", choices=["ash", "ballad", "coral", "sage", "verse"])
    images = ListField(StringField())
    num_questions = IntField(default=15)
    relevant_questions = ListField(EmbeddedDocumentField(TrainingQuestion)) 
    created_at = DateTimeField(default=datetime.datetime.utcnow)
