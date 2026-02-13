from django.contrib import admin
from .models import (
    Place,
    PlaceTranslation,
    Event,
    EventTranslation,
    Image,
    Comment,
    HotelDetails,
    RestaurantDetails,
    MuseumDetails,
    PlaceAmenity,
    PlaceContribution,
    RouteLog,
    TeamAdmin,
)


class PlaceTranslationInline(admin.TabularInline):
    model = PlaceTranslation
    extra = 1


class PlaceAmenityInline(admin.TabularInline):
    model = PlaceAmenity
    extra = 0


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("place_id", "type", "city", "latitude", "longitude")
    list_filter = ("type", "city")
    search_fields = ("city", "address")
    inlines = [PlaceTranslationInline, PlaceAmenityInline]


@admin.register(PlaceTranslation)
class PlaceTranslationAdmin(admin.ModelAdmin):
    list_display = ("place", "lang", "name")
    list_filter = ("lang",)


class EventTranslationInline(admin.TabularInline):
    model = EventTranslation
    extra = 1


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("event_id", "city", "start_at", "end_at")
    list_filter = ("city",)
    inlines = [EventTranslationInline]
