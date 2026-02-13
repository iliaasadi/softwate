import json
import logging
from urllib.parse import quote

from .config import (
    NESHAN_API_BASE,
    NESHAN_GEOCODING_PATH,
    NESHAN_GEOCODING_PLUS_PATH,
    NESHAN_REVERSE_PATH,
    get_api_key,
    is_configured,
)

logger = logging.getLogger(__name__)

def reverse_geocode(lat, lng):
    """
    تبدیل نقطه (عرض، طول) به آدرس با API نشان (v5/reverse).
    خروجی: دیکشنری کامل پاسخ شامل status، formatted_address، route_name، route_type،
    neighbourhood، city، state، place، municipality_zone، in_traffic_zone، in_odd_even_zone،
    village، county، district؛ در صورت خطا None.
    """
    if not is_configured():
        return None
    try:
        lat_f = float(lat)
        lng_f = float(lng)
    except (TypeError, ValueError):
        return None
    api_key = get_api_key()
    try:
        import requests
        url = f"{NESHAN_API_BASE.rstrip('/')}{NESHAN_REVERSE_PATH}"
        params = {"lat": lat_f, "lng": lng_f}
        headers = {"Api-Key": api_key}
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            logger.debug("Neshan reverse HTTP %s: %s", resp.status_code, resp.text[:200])
            return None
        data = resp.json()
        if not isinstance(data, dict):
            return None
        if data.get("status") != "OK":
            return None
        return data
    except Exception as e:
        logger.debug("Neshan reverse failed: %s", e)
        return None