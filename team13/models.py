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
    
class PlaceTranslation(models.Model):
    """ترجمه نام و توضیح مکان (چندزبانگی)."""

    place = models.ForeignKey(
        Place, on_delete=models.CASCADE, related_name="translations", db_column="place_id"
    )
    lang = models.CharField(max_length=2, choices=[("fa", "فارسی"), ("en", "English")])
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        app_label = "team13"
        db_table = "team13_place_translations"
        unique_together = [("place", "lang")]

    def __str__(self):
        return f"{self.place_id} ({self.lang})"


class Event(models.Model):
    """رویداد: تاریخ و مکان رویداد."""

    event_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, db_column="event_id"
    )
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    city = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        app_label = "team13"
        db_table = "team13_events"

    def __str__(self):
        return f"Event {self.event_id} — {self.city or 'بدون شهر'}"


class EventTranslation(models.Model):
    """ترجمه عنوان و توضیح رویداد."""

    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="translations", db_column="event_id"
    )
    lang = models.CharField(max_length=2, choices=[("fa", "فارسی"), ("en", "English")])
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        app_label = "team13"
        db_table = "team13_event_translations"
        unique_together = [("event", "lang")]

    def __str__(self):
        return f"{self.event_id} ({self.lang})"
