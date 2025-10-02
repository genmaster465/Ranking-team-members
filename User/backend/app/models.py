from datetime import datetime
from mongoengine import Document, EmbeddedDocument
from mongoengine import StringField, EmailField, BooleanField, DateTimeField
from mongoengine import FloatField, ListField, EmbeddedDocumentField, ReferenceField

class Admin(Document):
    meta = {'collection': 'admins', 'indexes': ['email'], 'strict': False}
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    name = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class User(Document):
    meta = {
        "collection": "users",
        "indexes": [
            {"fields": ["email"], "unique": True, "name": "uniq_email"}
        ]
    }
    name = StringField(required=True, max_length=120)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    is_admin = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class TemplateField(EmbeddedDocument):
    title = StringField(required=True, max_length=120)
    weight = FloatField(required=True, min_value=0)

class Template(Document):
    meta = {"collection": "templates"}
    name = StringField(required=True, max_length=120)
    fields = ListField(EmbeddedDocumentField(TemplateField), default=[])
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

class Score(Document):
    meta = {
        "collection": "scores",
        "indexes": [
            {"fields": ["rater", "target", "template", "-rated_at"], "name": "by_rater_target_tmpl"},
            {"fields": ["target", "-rated_at"], "name": "by_target_recent"}
        ]
    }
    rater = ReferenceField(User, required=True)
    target = ReferenceField(User, required=True)
    template = ReferenceField(Template, required=True)
    values = ListField(FloatField(min_value=0, max_value=100), required=True)
    rated_at = DateTimeField(default=datetime.utcnow)
    note = StringField()
