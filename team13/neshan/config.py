# تنظیمات API نشان — کلیدها و آدرس پایه را در .env قرار دهید.
# مستندات: https://platform.neshan.org/docs/
# دو کلید: service (فراخوانی از بک‌اند)، web (برای فرانت/نقشه در صورت نیاز).

import os
from django.conf import settings


def _get_setting(name, env_name, default=""):
    try:
        val = getattr(settings, name, None) or ""
    except Exception:
        val = ""
    val = (val or os.environ.get(env_name) or "").strip()
    return val or default


def get_api_key():
    """کلید سرویس نشان برای فراخوانی از بک‌اند (مسیریابی، reverse، جستجو)."""
    return _get_setting("NESHAN_API_KEY_SERVICE", "NESHAN_API_KEY_SERVICE") or _get_setting("NESHAN_API_KEY", "NESHAN_API_KEY") or os.environ.get("API_KEY", "").strip()


def get_web_key():
    """کلید وب نشان برای استفاده در فرانت (نقشه، در صورت نیاز)."""
    return _get_setting("NESHAN_API_KEY_WEB", "NESHAN_API_KEY_WEB")


def is_configured():
    """آیا حداقل یکی از کلیدهای نشان تنظیم شده است؟"""
    return bool(get_api_key() or get_web_key())


# آدرس پایهٔ API — مستندات: https://platform.neshan.org/docs/api/routing-category/routing/
NESHAN_API_BASE = "https://api.neshan.org"
# مسیریابی با ترافیک (خودرو/موتور): نوع وسیله type=car|motorcycle اجباری است.
NESHAN_DIRECTION_PATH = "/v4/direction"
# مسیریابی بدون ترافیک (فقط خودرو): https://platform.neshan.org/docs/api/routing-category/noTraffic-routing-api/
NESHAN_DIRECTION_NO_TRAFFIC_PATH = "/v4/direction/no-traffic"
# ماتریس فاصله: https://platform.neshan.org/docs/api/routing-category/distance-matrix/
NESHAN_DISTANCE_MATRIX_PATH = "/v1/distance-matrix"
NESHAN_DISTANCE_MATRIX_NO_TRAFFIC_PATH = "/v1/distance-matrix/no-traffic"
# مسیریابی فروشنده دوره‌گرد (TSP): https://platform.neshan.org/docs/api/routing-category/tsp/
NESHAN_TSP_PATH = "/v3/trip"
# محدوده در دسترس (Isochrone): https://platform.neshan.org/docs/api/routing-category/isochrone/
NESHAN_ISOCHRONE_PATH = "/v1/isochrone"
# نگاشت نقطه بر نقشه (Map Matching): https://platform.neshan.org/docs/api/routing-category/map-matching/
NESHAN_MAP_MATCHING_PATH = "/v3/map-matching"
# تبدیل نقطه به آدرس: https://platform.neshan.org/docs/api/search-category/reverse-geocoding/
NESHAN_REVERSE_PATH = "/v5/reverse"
# جستجوی مکان‌مبنا: https://platform.neshan.org/docs/api/search-category/search/
NESHAN_SEARCH_PATH = "/v1/search"
# تبدیل آدرس به مختصات: https://platform.neshan.org/docs/api/search-category/geocoding/
NESHAN_GEOCODING_PATH = "/geocoding/v1"
NESHAN_GEOCODING_PLUS_PATH = "/geocoding/v1/plus"
