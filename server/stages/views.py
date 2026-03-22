from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from project_access import is_platform_admin, is_freelancer, projects_queryset_for_user, user_can_access_project
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

    def get_queryset(self):
        user = self.request.user
        if is_platform_admin(user):
            queryset = ProjectStage.objects.all()
        elif is_freelancer(user):
            allowed_projects = projects_queryset_for_user(user)
            queryset = ProjectStage.objects.filter(project__in=allowed_projects)
        else:
            queryset = ProjectStage.objects.filter(project__customer=user)

        project_id = self.request.query_params.get('project_id')
        if project_id:
            try:
                project_id = int(project_id)
            except ValueError:
                raise ValidationError("project_id должен быть числом")

            project = get_object_or_404(Project, pk=project_id)
            if not user_can_access_project(user, project):
                raise PermissionDenied("Нет доступа к этапам этого проекта.")
            queryset = queryset.filter(project=project)

        return queryset
    
    def perform_update(self, serializer):
        """При обновлении проверяем права"""
        stage = self.get_object()
        if not is_platform_admin(self.request.user):
            # Проверяем, что пользователь является владельцем проекта
            if stage.project.customer != self.request.user:
                raise PermissionDenied("У вас нет прав для изменения этого этапа")
        serializer.save()
    
    def perform_destroy(self, instance):
        """При удалении проверяем права"""
        if not is_platform_admin(self.request.user):
            if instance.project.customer != self.request.user:
                raise PermissionDenied("У вас нет прав для удаления этого этапа")
        instance.delete()
    
    def perform_create(self, serializer):
        """При создании автоматически устанавливаем проект из project_id"""
        project_id = self.request.data.get('project')
        if not project_id:
            raise ValidationError("Требуется поле project")

        project = get_object_or_404(Project, pk=project_id)
        if not (is_platform_admin(self.request.user) or project.customer == self.request.user):
            raise PermissionDenied("Только заказчик или администратор может создавать этапы.")

        serializer.save(project=project)