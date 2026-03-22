from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from project_access import is_platform_admin, projects_queryset_for_user
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsProjectOwnerOrReadOnly
from notifications import send_project_created_notification

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectOwnerOrReadOnly]

    def get_queryset(self):
        return projects_queryset_for_user(self.request.user)

    def perform_create(self, serializer):
        requested_customer = serializer.validated_data.get("customer")

        if requested_customer is None:
            customer = self.request.user
        elif is_platform_admin(self.request.user):
            customer = requested_customer
        elif requested_customer == self.request.user:
            customer = self.request.user
        else:
            raise PermissionDenied("Only admin can assign project owner to another user.")

        project = serializer.save(customer=customer)
        send_project_created_notification(project)
