from django.urls import path
from . import views

urlpatterns = [
    path("", views.base, name="index"),
    path("ping/", views.ping, name="ping"),
    path("places/", views.place_list, name="place_list"),
    path("places/<uuid:place_id>/", views.place_detail, name="place_detail"),
    path("places/<uuid:place_id>/rate/", views.place_rate, name="place_rate"),
    path("places/<uuid:place_id>/add-image/", views.place_add_image, name="place_add_image"),
    path("places/<uuid:place_id>/add-comment/", views.place_add_comment, name="place_add_comment"),
    path("nearest-place/", views.nearest_place, name="nearest_place"),
    path("events/", views.event_list, name="event_list"),
    path("events/<uuid:event_id>/", views.event_detail, name="event_detail")
]
