from mongoengine import ReferenceField
from mongoengine import Document, StringField, ListField, DateTimeField, FloatField
import datetime

from models.userModel import User

class Payment(Document):
    user = ReferenceField(User, required=True)
    razorpay_order_id = StringField(required=True)
    razorpay_payment_id = StringField()
    razorpay_signature = StringField()
    amount = FloatField(required=True)  # in $
    currency = StringField(default="USD")
    status = StringField(default="created", choices=["created", "paid", "failed", "refunded"])
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    def mark_paid(self, payment_id, signature):
        """Mark payment as successful and update user's credits."""
        self.razorpay_payment_id = payment_id
        self.razorpay_signature = signature
        self.status = "paid"
        self.updated_at = datetime.datetime.utcnow()
        self.save()

        # Credit user's account (1 credit = $0.5)
        credits_to_add = self.amount
        self.user.credits += credits_to_add
        self.user.total_spent += self.amount
        self.user.payment_history.append(self)
        self.user.save()
