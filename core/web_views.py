from django.conf import settings
from django.shortcuts import render

def home(request):
    return render(request, "index.html", {"teams": settings.TEAM_APPS})