from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsProjectOwnerOrReadOnly
from notifications import send_project_created_notification

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # ADMIN видит все
            return Project.objects.all()
        return Project.objects.filter(customer=user)
    
    def perform_create(self, serializer):
        project = serializer.save(customer=self.request.user)
        send_project_created_notification(project)
