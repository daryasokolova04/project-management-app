from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from projects.permissions import IsProjectOwnerOrReadOnly

from .models import ProjectStage
from .serializers import ProjectStageSerializer
from projects.models import Project


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                name='project_id',
                type=int,
                location=OpenApiParameter.QUERY,
                description='ID проекта',
                required=True,
            )
        ]
    )
)
class ProjectStageViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectStageSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectOwnerOrReadOnly]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if not project_id:
            raise ValidationError("Требуется параметр project_id")

        try:
            project_id = int(project_id)
        except ValueError:
            raise ValidationError("project_id должен быть числом")

        project = get_object_or_404(Project, pk=project_id, customer=self.request.user)
        return ProjectStage.objects.filter(project=project)
