import logging
from .config import get_api_key, is_configured, NESHAN_API_BASE, NESHAN_TSP_PATH

logger = logging.getLogger(__name__)


def fetch_tsp(waypoints, round_trip=True, source_is_any_point=True, last_is_any_point=True):
    """
    ترتیب بهینهٔ بازدید از نقاط (TSP).
    waypoints: لیست نقاط، هر نقطه (lat, lng) یا شیء با .lat/.lng یا رشتهٔ "lat,lng|lat,lng".
    round_trip: بازگشت به نقطهٔ شروع (پیش‌فرض True).
    source_is_any_point: انتخاب بهینهٔ مبدأ از بین نقاط (پیش‌فرض True).
    last_is_any_point: انتخاب بهینهٔ مقصد از بین نقاط (پیش‌فرض True).
    خروجی: لیست نقاط به ترتیب بهینه، هر عنصر {"name", "location": [lng, lat], "index"}؛ در صورت خطا None.
    """
    if not is_configured():
        return None
    api_key = get_api_key()
    if not waypoints:
        return None
    # ساخت رشتهٔ waypoints به صورت lat,lng|lat,lng
    if isinstance(waypoints, str):
        parts = [p.strip() for p in waypoints.split("|") if p.strip()]
        if len(parts) < 2:
            return None
        waypoints_str = "|".join(parts)
    else:
        parts = []
        for wp in waypoints:
            if isinstance(wp, (list, tuple)) and len(wp) >= 2:
                parts.append(f"{wp[0]},{wp[1]}")
            elif hasattr(wp, "lat") and hasattr(wp, "lng"):
                parts.append(f"{wp.lat},{wp.lng}")
            elif isinstance(wp, dict):
                lat = wp.get("lat") or wp.get("latitude")
                lng = wp.get("lng") or wp.get("longitude")
                if lat is not None and lng is not None:
                    parts.append(f"{lat},{lng}")
        if len(parts) < 2:
            return None
        waypoints_str = "|".join(parts)