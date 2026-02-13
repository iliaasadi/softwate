# مدل‌های سرویس Facilities & Transportation — مطابق P5_Axiom
# توجه: کاربر (User) در core و دیتابیس default است؛ در اینجا فقط user_id ذخیره می‌شود.

import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# برای سازگاری با SQLite پیش‌فرض، از دو فیلد عرض/طول استفاده شده است.
# در صورت استفاده از PostgreSQL/PostGIS می‌توان از PointField استفاده کرد.


class Place(models.Model):
    """مکان (POI): رستوران، بیمارستان، موزه، هتل، تفریحی."""

    class PlaceType(models.TextChoices):
        ENTERTAINMENT = "entertainment", "تفریحی"
        FOOD = "food", "غذا"
        HOSPITAL = "hospital", "بیمارستان"
        MUSEUM = "museum", "موزه"
        HOTEL = "hotel", "هتل"
        FIRE_STATION = "fire_station", "آتش‌نشانی"
        PHARMACY = "pharmacy", "داروخانه"
        CLINIC = "clinic", "کلینیک"

    place_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, db_column="place_id"
    )
    type = models.CharField(max_length=32, choices=PlaceType.choices)
    city = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        app_label = "team13"
        db_table = "team13_places"

    def __str__(self):
        return f"{self.get_type_display()} — {self.city or 'بدون شهر'}"
