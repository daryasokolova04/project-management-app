from rest_framework import permissions

class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    @staticmethod
    def _is_admin(user):
        return bool(getattr(user, "is_staff", False) or getattr(user, "role", None) == "ADMIN")

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
        if self._is_admin(request.user):
            return True
        owner = self._project_owner(obj)
        return owner == request.user
