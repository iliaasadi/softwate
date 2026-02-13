from django.conf import settings

class TeamPerAppRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label in settings.TEAM_APPS:
            return model._meta.app_label
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label in settings.TEAM_APPS:
            return model._meta.app_label
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in settings.TEAM_APPS:
            return db == app_label
        return db == "default"
