from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from project_management.models import PaymentRecord
from .serializers import PaymentRecordSerializer


class PaymentRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PaymentRecord.objects.select_related('project')
        project_id = self.kwargs.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project is None:
            raise PermissionDenied("Project is required.")

        user = self.request.user
        is_owner = False
        if hasattr(user, "user_id"):
            is_owner = project.customer_id == user.user_id
        else:
            user_email = getattr(user, "email", None)
            if user_email:
                is_owner = project.customer.email == user_email

        if not (is_owner or user.is_staff):
            raise PermissionDenied("Only the project customer can create payments.")

        serializer.save(created_at=timezone.now())
