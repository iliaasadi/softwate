import logging
from .config import get_api_key, is_configured, NESHAN_API_BASE, NESHAN_SEARCH_PATH

logger = logging.getLogger(__name__)

# مرکز پیش‌فرض (تهران) وقتی lat/lng از فراخوان‌دهنده ارسال نشود
DEFAULT_LAT = 35.6892
DEFAULT_LNG = 51.3890


def _search_raw(term, lat_f, lng_f):
    """یک درخواست GET به API جستجو؛ خروجی خام { count, items } یا در خطا None. API حداکثر ۳۰ نتیجه برمی‌گرداند."""
    if not is_configured():
        return None
    api_key = get_api_key()
    try:
        import requests
        url = f"{NESHAN_API_BASE.rstrip('/')}{NESHAN_SEARCH_PATH}"
        params = {"term": term, "lat": lat_f, "lng": lng_f}
        headers = {"Api-Key": api_key}
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            logger.debug("Neshan search HTTP %s: %s", resp.status_code, resp.text[:200])
            return None
        return resp.json()
    except Exception as e:
        logger.debug("Neshan search failed: %s", e)
        return None
