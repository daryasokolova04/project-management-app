from rest_framework import permissions

from project_access import is_platform_admin


class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    @staticmethod
    def _project_owner(obj):
        if hasattr(obj, "customer"):
            return obj.customer
        if hasattr(obj, "project") and hasattr(obj.project, "customer"):
            return obj.project.customer
        if hasattr(obj, "stage") and hasattr(obj.stage, "project") and hasattr(obj.stage.project, "customer"):
            return obj.stage.project.customer
        return None

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if is_platform_admin(request.user):
            return True
        owner = self._project_owner(obj)
        return owner == request.user
