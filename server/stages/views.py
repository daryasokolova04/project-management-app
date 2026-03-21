from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from projects.permissions import IsProjectOwnerOrReadOnly
from .models import ProjectStage
from projects.models import Project
from .serializers import ProjectStageSerializer


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

    @staticmethod
    def _is_admin(user):
        return bool(getattr(user, "is_staff", False) or getattr(user, "role", None) == "ADMIN")

    def get_queryset(self):
        # Получаем все стадии для начала
        queryset = ProjectStage.objects.all()
        
        # Если есть project_id - фильтруем по нему
        project_id = self.request.query_params.get('project_id')
        if project_id:
            try:
                project_id = int(project_id)
                # Проверка прав на проект
                if self._is_admin(self.request.user) or getattr(self.request.user, "role", None) == "FREELANCER":
                    project = get_object_or_404(Project, pk=project_id)
                else:
                    project = get_object_or_404(Project, pk=project_id, customer=self.request.user)
                queryset = queryset.filter(project=project)
            except ValueError:
                raise ValidationError("project_id должен быть числом")
        
        return queryset
    
    def perform_update(self, serializer):
        """При обновлении проверяем права"""
        stage = self.get_object()
        if not self._is_admin(self.request.user):
            # Проверяем, что пользователь является владельцем проекта
            if stage.project.customer != self.request.user:
                raise PermissionDenied("У вас нет прав для изменения этого этапа")
        serializer.save()
    
    def perform_destroy(self, instance):
        """При удалении проверяем права"""
        if not self._is_admin(self.request.user):
            if instance.project.customer != self.request.user:
                raise PermissionDenied("У вас нет прав для удаления этого этапа")
        instance.delete()
    
    def perform_create(self, serializer):
        """При создании автоматически устанавливаем проект из project_id"""
        project_id = self.request.data.get('project')
        if not project_id:
            raise ValidationError("Требуется поле project")
        
        # Проверяем права на создание этапа в проекте
        if self._is_admin(self.request.user) or getattr(self.request.user, "role", None) == "FREELANCER":
            project = get_object_or_404(Project, pk=project_id)
        else:
            project = get_object_or_404(Project, pk=project_id, customer=self.request.user)
        
        serializer.save(project=project)