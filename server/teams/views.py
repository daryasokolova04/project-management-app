from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db import IntegrityError
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiTypes
from project_access import is_platform_admin, teams_queryset_for_user, user_can_access_project
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer, AddTeamMemberSerializer


def _can_manage_team(user, team: Team) -> bool:
    """Создание/редактирование состава команды — заказчик проекта или админ."""
    return is_platform_admin(user) or team.project.customer_id == getattr(user, "pk", None)


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления командами проекта.
    """
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = teams_queryset_for_user(self.request.user)
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project is None:
            raise PermissionDenied("Требуется проект.")
        if not (is_platform_admin(self.request.user) or project.customer == self.request.user):
            raise PermissionDenied("Только заказчик проекта или администратор может создавать команды.")
        serializer.save()

    def perform_update(self, serializer):
        team = serializer.instance
        if not _can_manage_team(self.request.user, team):
            raise PermissionDenied("Только заказчик проекта или администратор может изменять команду.")
        serializer.save()

    def perform_destroy(self, instance):
        if not _can_manage_team(self.request.user, instance):
            raise PermissionDenied("Только заказчик проекта или администратор может удалять команду.")
        instance.delete()

    @extend_schema(
        description="Добавить участника в команду",
        request=AddTeamMemberSerializer,
        responses={
            201: TeamMemberSerializer,
            400: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT
        },
        examples=[
            OpenApiExample(
                'Пример запроса',
                value={
                    'user_id': 1,
                    'role_in_team': 'DEVELOPER'
                },
                request_only=True,
            ),
        ],
    )
    @action(detail=True, methods=['post'], url_path='members')
    def add_member(self, request, pk=None):
        team = self.get_object()
        if not _can_manage_team(request.user, team):
            raise PermissionDenied("Только заказчик проекта или администратор может менять состав команды.")

        serializer = AddTeamMemberSerializer(data=request.data)

        if serializer.is_valid():
            try:
                team_member = TeamMember.objects.create(
                    team=team,
                    user_id=serializer.validated_data['user_id'],
                    role_in_team=serializer.validated_data['role_in_team']
                )
                return Response(
                    TeamMemberSerializer(team_member).data,
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError:
                return Response(
                    {"error": "Пользователь уже является участником этой команды"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        team = self.get_object()
        if not _can_manage_team(request.user, team):
            raise PermissionDenied("Только заказчик проекта или администратор может менять состав команды.")

        try:
            team_member = TeamMember.objects.get(team=team, user_id=user_id)
            team_member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TeamMember.DoesNotExist:
            return Response(
                {"error": "Участник не найден в этой команде"},
                status=status.HTTP_404_NOT_FOUND
            )
