import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from mongoengine import connect
from datetime import datetime
import bcrypt

from .models import Admin, User, Template, TemplateField, Score
from .jwt_util import create_jwt, verify_jwt

MONGO_URI=os.getenv("MONGO_URI","mongodb+srv://kevin:0204@cluster0.7crfxom.mongodb.net/")
print(MONGO_URI)
DB_NAME=os.getenv("DB_NAME","ratings_db")
connect(host=MONGO_URI, db=DB_NAME)

origins = os.getenv("CORS_ORIGINS","http://localhost:5173").split(",")
app = FastAPI(title="Admin API")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    payload = verify_jwt(authorization.split()[1])
    if not payload or not payload.get("admin_id"):
        raise HTTPException(status_code=401, detail="Invalid token")
    adm = Admin.objects(id=payload["admin_id"]).first()
    if not adm: raise HTTPException(status_code=401, detail="Admin not found")
    return adm

# ---------- Schemas ----------
class Signup(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str

class TemplateFieldIn(BaseModel):
    title: str
    weight: float

class TemplateIn(BaseModel):
    name: str
    fields: List[TemplateFieldIn]

class ScoreIn(BaseModel):
    target_id: str
    template_id: str
    values: List[float]
    note: Optional[str] = None

# ---------- Auth ----------
@app.post("/auth/signup")
def admin_signup(body: Signup):
    if Admin.objects(email=body.email).first():
        raise HTTPException(400, "Email exists")
    pw = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    adm = Admin(email=body.email, password_hash=pw, name=body.name).save()
    token = create_jwt({"admin_id": str(adm.id), "role":"admin"})
    return {"token": token, "admin": {"id": str(adm.id), "email": adm.email, "name": adm.name}}

@app.post("/auth/login")
def admin_login(body: Login):
    adm = Admin.objects(email=body.email).first()
    if not adm or not bcrypt.checkpw(body.password.encode(), adm.password_hash.encode()):
        raise HTTPException(401, "Invalid credentials")
    token = create_jwt({"admin_id": str(adm.id), "role":"admin"})
    return {"token": token, "admin": {"id": str(adm.id), "email": adm.email, "name": adm.name}}

@app.get("/auth/me")
def me(admin=Depends(get_current_admin)):
    return {"id": str(admin.id), "email": admin.email, "name": admin.name, "role": "admin"}

# ---------- Users CRUD ----------
class UserIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_admin: bool = False

@app.get("/users")
def list_users(q: Optional[str]=None, page:int=1, limit:int=20, admin=Depends(get_current_admin)):
    qs = User.objects
    if q: qs = qs.filter(name__icontains=q)
    total = qs.count()
    items = [ {"id": str(u.id), "name": u.name, "email": u.email, "is_admin": u.is_admin} for u in qs.skip((page-1)*limit).limit(limit) ]
    return {"total": total, "items": items}

@app.post("/users")
def create_user(body: UserIn, admin=Depends(get_current_admin)):
    if User.objects(email=body.email).first():
        raise HTTPException(400, "Email exists")
    pw = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    u = User(name=body.name, email=body.email, password_hash=pw, is_admin=body.is_admin).save()
    return {"id": str(u.id)}

@app.put("/users/{user_id}")
def update_user(user_id: str, body: UserIn, admin=Depends(get_current_admin)):
    u = User.objects(id=user_id).first() or HTTPException(404,"Not found")
    if isinstance(u, HTTPException): raise u
    u.name, u.email, u.is_admin = body.name, body.email, body.is_admin
    u.updated_at = datetime.utcnow()
    if body.password:
        u.password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    u.save()
    return {"ok": True}

@app.delete("/users/{user_id}")
def delete_user(user_id: str, admin=Depends(get_current_admin)):
    User.objects(id=user_id).delete()
    return {"ok": True}

# ---------- Templates CRUD ----------
@app.get("/templates")
def list_templates(q: Optional[str]=None, admin=Depends(get_current_admin)):
    qs = Template.objects
    if q: qs = qs.filter(name__icontains=q)
    return [ {"id": str(t.id), "name": t.name, "fields": [{"title":f.title,"weight":f.weight} for f in t.fields]} for t in qs ]

@app.post("/templates")
def create_template(body: TemplateIn, admin=Depends(get_current_admin)):
    t = Template(name=body.name, fields=[TemplateField(**f.model_dump()) for f in body.fields]).save()
    return {"id": str(t.id)}

@app.put("/templates/{tid}")
def update_template(tid: str, body: TemplateIn, admin=Depends(get_current_admin)):
    t = Template.objects(id=tid).first() or HTTPException(404, "Not found")
    if isinstance(t, HTTPException): raise t
    t.name = body.name
    t.fields = [TemplateField(**f.model_dump()) for f in body.fields]
    t.updated_at = datetime.utcnow()
    t.save()
    return {"ok": True}

@app.delete("/templates/{tid}")
def delete_template(tid: str, admin=Depends(get_current_admin)):
    Template.objects(id=tid).delete()
    return {"ok": True}

# ---------- Scores (admin can rate anyone) ----------
@app.post("/scores")
def submit_score(body: ScoreIn, admin=Depends(get_current_admin)):
    target = User.objects(id=body.target_id).first() or HTTPException(404,"Target not found")
    tmpl = Template.objects(id=body.template_id).first() or HTTPException(404,"Template not found")
    if isinstance(target, HTTPException): raise target
    if isinstance(tmpl, HTTPException): raise tmpl
    if len(body.values) != len(tmpl.fields): raise HTTPException(400,"Values length must match template fields")
    s = Score(rater=None, target=target, template=tmpl, values=[float(v) for v in body.values], note=body.note).save()
    return {"id": str(s.id)}

# ---------- Leaderboard / totals ----------
@app.get("/stats/leaderboard")
def leaderboard(admin=Depends(get_current_admin)):
    out = {}
    for s in Score.objects:
        weights = [f.weight for f in s.template.fields]
        total_weight = sum(weights) if sum(weights)>0 else 1.0
        weighted = sum(v * w for v, w in zip(s.values, weights)) / total_weight
        key = str(s.target.id)
        out.setdefault(key, {"target_id": key, "sum":0.0, "n":0})
        out[key]["sum"] += weighted
        out[key]["n"] += 1
    for k,v in out.items():
        v["avg_weighted"] = v["sum"]/max(1,v["n"])
    return sorted(out.values(), key=lambda x: x["avg_weighted"], reverse=True)
