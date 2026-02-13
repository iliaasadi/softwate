from django.contrib.auth import get_user_model
from django.utils.deprecation import MiddlewareMixin
from jwt import ExpiredSignatureError, InvalidTokenError

from core.jwt_utils import decode_token

User = get_user_model()


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    If a valid access_token cookie (or Authorization header) exists, set request.user accordingly.
    """

    def process_request(self, request):
        if hasattr(request, "user") and getattr(request.user, "is_authenticated", False):
            return

        token = request.COOKIES.get("access_token")
        if not token:
            auth = request.headers.get("Authorization", "")
            if auth.startswith("Bearer "):
                token = auth.split(" ", 1)[1].strip()

        if not token:
            return

        try:
            payload = decode_token(token)
            if payload.get("type") != "access":
                return

            user_id = payload.get("sub")
            tv = payload.get("tv")
            user = User.objects.filter(id=user_id, is_active=True).first()
            if not user:
                return

            if user.token_version != tv:
                return

            request.user = user
            request.jwt_payload = payload
        except (ExpiredSignatureError, InvalidTokenError):
            return
