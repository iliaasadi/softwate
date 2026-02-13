import logging
from .config import (
    get_api_key,
    is_configured,
    NESHAN_API_BASE,
    NESHAN_DIRECTION_PATH,
    NESHAN_DIRECTION_NO_TRAFFIC_PATH,
)

logger = logging.getLogger(__name__)

# نوع وسیله برای API نشان
VEHICLE_CAR = "car"
VEHICLE_MOTORCYCLE = "motorcycle"
VEHICLE_PEDESTRIAN = "pedestrian"