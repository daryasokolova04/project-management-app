from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from project_access import is_platform_admin, user_can_access_project
from project_management.models import PaymentRecord, Project
from .serializers import PaymentRecordSerializer


class PaymentRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PaymentRecord.objects.select_related('project')
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        else:
            return PaymentRecord.objects.none()

        project = get_object_or_404(Project, pk=project_id)
        if not user_can_access_project(self.request.user, project):
            raise PermissionDenied("Нет доступа к платежам этого проекта.")
        return queryset

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project is None:
            raise PermissionDenied("Project is required.")

        user = self.request.user
        is_owner = project.customer_id == getattr(user, "pk", None)
        if not (is_owner or is_platform_admin(user)):
            raise PermissionDenied("Only the project customer can create payments.")

        serializer.save(created_at=timezone.now())
