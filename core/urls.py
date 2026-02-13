from django.urls import path
from . import views

urlpatterns = [
    path("auth/signup/", views.signup_api),
    path("auth/login/", views.login_api),
    path("auth/refresh/", views.refresh_api),
    path("auth/logout/", views.logout_api),
    path("auth/me/", views.me),
    path("auth/verify/", views.verify),
    path("health/", views.health),
]