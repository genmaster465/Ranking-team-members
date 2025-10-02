import os, time, hmac, base64, json, hashlib
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = "HS256"

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64urldecode(s: str) -> bytes:
    padding = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)

def create_jwt(payload: dict, exp_seconds=60*60*24*7):
    header = {"alg": JWT_ALG, "typ": "JWT"}
    payload = dict(payload)
    payload["exp"] = int(time.time()) + exp_seconds
    b = f"{_b64url(json.dumps(header).encode())}.{_b64url(json.dumps(payload).encode())}".encode()
    sig = hmac.new(JWT_SECRET.encode(), b, hashlib.sha256).digest()
    return b.decode() + "." + _b64url(sig)

def verify_jwt(token: str):
    try:
        head_b64, pay_b64, sig_b64 = token.split(".")
        b = f"{head_b64}.{pay_b64}".encode()
        sig = _b64urldecode(sig_b64)
        good = hmac.compare_digest(sig, hmac.new(JWT_SECRET.encode(), b, hashlib.sha256).digest())
        if not good: return None
        payload = json.loads(_b64urldecode(pay_b64))
        if payload.get("exp", 0) < int(time.time()): return None
        return payload
    except Exception:
        return None
