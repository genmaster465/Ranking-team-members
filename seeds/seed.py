import os, bcrypt, random
from dotenv import load_dotenv
from mongoengine import connect
from app_models import Admin, User, Template, TemplateField, Score

load_dotenv()
MONGO_URI=os.getenv("MONGO_URI","mongodb://localhost:27017/ratings_db")
DB_NAME=os.getenv("DB_NAME","ratings_db")
connect(host=MONGO_URI, db=DB_NAME)

def upsert_admin(email, name, password):
    a = Admin.objects(email=email).first()
    ph = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    if a: 
        a.name = name; a.password_hash = ph; a.save(); return a
    return Admin(email=email, name=name, password_hash=ph).save()

def upsert_user(email, name, password, is_admin=False):
    u = User.objects(email=email).first()
    ph = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    if u: 
        u.name=name; u.password_hash=ph; u.is_admin=is_admin; u.save(); return u
    return User(email=email, name=name, password_hash=ph, is_admin=is_admin).save()

def ensure_templates():
    t = Template.objects(name="General Performance").first()
    if not t:
        t = Template(name="General Performance", fields=[
            TemplateField(title="Quality", weight=0.5),
            TemplateField(title="Speed", weight=0.3),
            TemplateField(title="Communication", weight=0.2),
        ]).save()
    return t

def random_scores(tmpl, raters, targets):
    for r in raters:
        for tg in targets:
            if r.id == tg.id: continue
            vals = [random.randint(60,95) for _ in tmpl.fields]
            Score(rater=r, target=tg, template=tmpl, values=[float(v) for v in vals], note="seed").save()

if __name__ == "__main__":
    adm = upsert_admin("admin@example.com","Admin One","pass123")
    u1 = upsert_user("alice@example.com","Alice","pass123", False)
    u2 = upsert_user("bob@example.com","Bob","pass123", False)
    u3 = upsert_user("carol@example.com","Carol","pass123", False)
    tmpl = ensure_templates()
    random_scores(tmpl, [u1,u2,u3], [u1,u2,u3])
    print("Seed complete.")
