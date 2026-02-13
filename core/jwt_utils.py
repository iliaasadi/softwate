import time
import jwt
from django.conf import settings


def _now() -> int:
    return int(time.time())


def create_access_token(user) -> str:
    payload = {
        "type": "access",
        "sub": str(user.id),
        "email": user.email,
        "tv": user.token_version,
        "iat": _now(),
        "exp": _now() + settings.JWT_ACCESS_TTL_SECONDS,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user) -> str:
    payload = {
        "type": "refresh",
        "sub": str(user.id),
        "tv": user.token_version,
        "iat": _now(),
        "exp": _now() + settings.JWT_REFRESH_TTL_SECONDS,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
