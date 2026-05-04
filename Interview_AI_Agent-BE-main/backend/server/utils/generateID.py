import random
import string
from models.candidateModel import Candidate
from models.interviewModel import Interview
from models.mockInterviewModel import MockInterview

def generate_unique_id(typeID):
    """Generate a unique candidate ID with 2 letters + 4 digits."""
    while True:
        letters = ''.join(random.choices(string.ascii_uppercase, k=2))
        digits = ''.join(random.choices(string.digits, k=4))
        cand_id = f"{letters}{digits}"

        if typeID == "interview":
            # Check if int_id already exists in DB
            if not Interview.objects(int_id=cand_id).first():
                return cand_id
            
        if typeID == "mock":
            # Check if cand_id already exists in DB
            if not MockInterview.objects(int_id=cand_id).first():
                return cand_id
            
        # Check if cand_id already exists in DB
        if not Candidate.objects(cand_id=cand_id).first():
            return cand_id