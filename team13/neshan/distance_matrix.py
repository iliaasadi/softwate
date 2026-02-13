import logging
from .config import (
    get_api_key,
    is_configured,
    NESHAN_API_BASE,
    NESHAN_DISTANCE_MATRIX_PATH,
    NESHAN_DISTANCE_MATRIX_NO_TRAFFIC_PATH,
)

logger = logging.getLogger(__name__)

TYPE_CAR = "car"
TYPE_MOTORCYCLE = "motorcycle"


def _points_to_string(points):
    """تبدیل لیست نقاط به رشتهٔ lat,lng|lat,lng|..."""
    parts = []
    for p in points:
        if isinstance(p, str) and "," in p:
            parts.append(p.strip())
        elif isinstance(p, (list, tuple)) and len(p) >= 2:
            parts.append(f"{p[0]},{p[1]}")
        elif hasattr(p, "lat") and hasattr(p, "lng"):
            parts.append(f"{p.lat},{p.lng}")
        elif isinstance(p, dict):
            lat = p.get("lat") or p.get("latitude")
            lng = p.get("lng") or p.get("longitude")
            if lat is not None and lng is not None:
                parts.append(f"{lat},{lng}")
    return "|".join(parts) if parts else ""
