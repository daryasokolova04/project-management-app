from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsProjectOwnerOrReadOnly
from notifications import send_project_created_notification

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectOwnerOrReadOnly]

    @staticmethod
    def _is_admin(user):
        return bool(getattr(user, "is_staff", False) or getattr(user, "role", None) == "ADMIN")

    def get_queryset(self):
        user = self.request.user
        if self._is_admin(user):
            return Project.objects.all()
        if getattr(user, "role", None) == "FREELANCER":
            return Project.objects.all()
        return Project.objects.filter(customer=user)

    def perform_create(self, serializer):
        requested_customer = serializer.validated_data.get("customer")

        if requested_customer is None:
            customer = self.request.user
        elif self._is_admin(self.request.user):
            customer = requested_customer
        elif requested_customer == self.request.user:
            customer = self.request.user
        else:
            raise PermissionDenied("Only admin can assign project owner to another user.")

        project = serializer.save(customer=customer)
        send_project_created_notification(project)
