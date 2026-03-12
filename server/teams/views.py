from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import IntegrityError
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiTypes
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer, AddTeamMemberSerializer


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления командами проекта.
    """
    queryset = Team.objects.all().select_related('project').prefetch_related('members__user')
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация команд по проекту"""
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        """Создание команды (проверка прав на проект)"""
        # Здесь можно добавить проверку, что пользователь имеет права на проект
        serializer.save()

    @action(detail=True, methods=['post'], url_path='members')
    def add_member(self, request, pk=None):
        """
        Добавление участника в команду.
        """
        team = self.get_object()
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
        """
        Удаление участника из команды.
        """
        team = self.get_object()

        try:
            team_member = TeamMember.objects.get(team=team, user_id=user_id)
            team_member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TeamMember.DoesNotExist:
            return Response(
                {"error": "Участник не найден в этой команде"},
                status=status.HTTP_404_NOT_FOUND
            )
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
        """
        Добавление участника в команду.
        
        Пример запроса:
        {
            "user_id": 1,
            "role_in_team": "DEVELOPER"
        }
        """
        team = self.get_object()
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