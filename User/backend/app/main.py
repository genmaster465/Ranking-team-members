import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from mongoengine import connect, DoesNotExist
from datetime import datetime
import bcrypt

from .models import Admin, User, Template, TemplateField, Score
from .jwt_util import create_jwt, verify_jwt

app = Flask(__name__)
origins = os.getenv("CORS_ORIGINS","http://localhost:5173").split(",")
CORS(app, resources={r"*": {"origins": origins}}, supports_credentials=True)

MONGO_URI=os.getenv("MONGO_URI","mongodb://localhost:27017/ratings_db")
DB_NAME=os.getenv("DB_NAME","ratings_db")
connect(host=MONGO_URI, db=DB_NAME)

def auth_required(role="user"):
    def wrapper(fn):
        def inner(*args, **kwargs):
            auth = request.headers.get("Authorization","")
            if not auth.startswith("Bearer "):
                return {"error":"Missing token"}, 401
            payload = verify_jwt(auth.split()[1])
            if not payload or not payload.get("user_id"):
                return {"error":"Invalid token"}, 401
            request.user_id = payload["user_id"]
            return fn(*args, **kwargs)
        inner.__name__ = fn.__name__
        return inner
    return wrapper

# --------- Auth ---------
@app.post("/auth/signup")
def signup():
    data = request.get_json(force=True)
    email = data.get("email"); password = data.get("password"); name=data.get("name","")
    if not (email and password): return {"error":"email and password required"},400
    if User.objects(email=email).first():
        return {"error":"Email exists"}, 400
    pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    u = User(email=email, name=name, password_hash=pw, is_admin=False).save()
    token = create_jwt({"user_id": str(u.id), "role":"user"})
    return {"token": token, "user":{"id":str(u.id),"email":u.email,"name":u.name,"is_admin":u.is_admin}}

@app.post("/auth/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email"); password = data.get("password")
    u = User.objects(email=email).first()
    if not u or not bcrypt.checkpw(password.encode(), u.password_hash.encode()):
        return {"error":"Invalid credentials"}, 401
    token = create_jwt({"user_id": str(u.id), "role":"user"})
    return {"token": token, "user":{"id":str(u.id),"email":u.email,"name":u.name,"is_admin":u.is_admin}}

@app.get("/auth/me")
@auth_required()
def me():
    u = User.objects(id=request.user_id).first()
    return {"id": str(u.id), "email": u.email, "name": u.name, "role": "admin" if u.is_admin else "user"}

# --------- View Endpoints ---------
@app.get("/users")
@auth_required()
def users_list():
    # only non-admin users and exclude self
    qs = User.objects(is_admin=False).only("name", "email")
    items = [
        {"id": str(u.id), "name": u.name, "email": u.email}
        for u in qs
        if str(u.id) != request.user_id
    ]
    return {"items": items}

@app.get("/templates")
@auth_required()
def templates_list():
    items = [{"id":str(t.id),"name":t.name,"fields":[{"title":f.title,"weight":f.weight} for f in t.fields]} for t in Template.objects]
    return {"items": items}

@app.post("/scores")
@auth_required()
def submit_score():
    data = request.get_json(force=True)
    template_id = data.get("template_id")
    target_id = data.get("target_id")
    values = data.get("values", [])
    note = data.get("note")

    if not (template_id and target_id and isinstance(values, list)):
        return {"error": "template_id, target_id, values[] required"}, 400
    if request.user_id == target_id:
        return {"error": "Cannot rate yourself"}, 400

    try:
        t = Template.objects.get(id=template_id)
        target = User.objects.get(id=target_id)
        rater = User.objects.get(id=request.user_id)
    except DoesNotExist:
        return {"error": "Invalid template or user"}, 404

    if len(values) != len(t.fields):
        return {"error": "Values length must match template fields"}, 400

    s = Score(rater=rater, target=target, template=t, values=[float(v) for v in values], note=note).save()
    return {"id": str(s.id)}

@app.get("/scores/history")
@auth_required()
def score_history():
    s = Score.objects(rater=request.user_id).order_by("-rated_at")
    items = [{
        "id": str(x.id),
        "target": {"id":str(x.target.id), "name": x.target.name},
        "template": {"id":str(x.template.id), "name": x.template.name},
        "values": x.values,
        "rated_at": x.rated_at.isoformat(),
        "note": x.note,
    } for x in s]
    return {"items": items}

@app.get("/stats/leaderboard")
@auth_required()
def leaderboard():
    out = {}
    for s in Score.objects:
        weights = [f.weight for f in s.template.fields]
        total_weight = sum(weights) if sum(weights)>0 else 1.0
        weighted = sum(v * w for v, w in zip(s.values, weights)) / total_weight
        key = str(s.target.id)
        out.setdefault(key, {"target_id": key, "name": s.target.name, "sum":0.0, "n":0})
        out[key]["sum"] += weighted
        out[key]["n"] += 1
    for k,v in out.items():
        v["avg_weighted"] = v["sum"]/max(1,v["n"])
    return sorted(out.values(), key=lambda x: x["avg_weighted"], reverse=True)

@app.get("/rating/defaults")
@auth_required()
def rating_defaults():
    first_template = Template.objects.first()
    first_target = User.objects(is_admin=False, id__ne=request.user_id).first()
    return {
        "template_id": str(first_template.id) if first_template else None,
        "target_id": str(first_target.id) if first_target else None,
    }