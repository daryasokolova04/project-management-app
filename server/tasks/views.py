from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample, OpenApiTypes
from project_access import user_can_access_project
from .models import Task
from stages.models import ProjectStage
from .serializers import TaskSerializer, TaskCreateUpdateSerializer
from notifications import send_task_assignment_notification


@extend_schema_view(
    list=extend_schema(
        description="Получить список задач этапа. Можно фильтровать по assignee и status",
        parameters=[
            OpenApiParameter(
                name='assignee',
                description='ID исполнителя для фильтрации задач',
                required=False,
                type=int,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name='status',
                description='Статус задачи (OPEN, IN_PROGRESS, DONE)',
                required=False,
                type=str,
                enum=['OPEN', 'IN_PROGRESS', 'DONE'],
                location=OpenApiParameter.QUERY,
            ),
        ],
        responses={200: TaskSerializer(many=True)}
    ),
    create=extend_schema(
        description="Создать новую задачу в этапе",
        request=TaskCreateUpdateSerializer,
        responses={201: TaskSerializer}
    ),
    retrieve=extend_schema(
        description="Получить детальную информацию о задаче",
        responses={200: TaskSerializer}
    ),
    update=extend_schema(
        description="Обновить задачу полностью",
        request=TaskCreateUpdateSerializer,
        responses={200: TaskSerializer}
    ),
    partial_update=extend_schema(
        description="Частично обновить задачу",
        request=TaskCreateUpdateSerializer,
        responses={200: TaskSerializer}
    ),
    destroy=extend_schema(description="Удалить задачу", responses={204: None}),
)
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        stage_id = self.kwargs.get('stage_id')
        stage = get_object_or_404(ProjectStage, pk=stage_id)
        if not user_can_access_project(self.request.user, stage.project):
            raise PermissionDenied("Нет доступа к задачам этого этапа.")

        queryset = Task.objects.filter(stage=stage).select_related('assignee', 'stage')

        # Фильтрация по исполнителю
        assignee_id = self.request.query_params.get('assignee')
        if assignee_id:
            queryset = queryset.filter(assignee_id=assignee_id)

        # Фильтрация по статусу
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        stage_id = self.kwargs.get('stage_id')
        stage = get_object_or_404(ProjectStage, pk=stage_id)
        if not user_can_access_project(self.request.user, stage.project):
            raise PermissionDenied("Нет доступа к задачам этого этапа.")
        task = serializer.save(stage=stage)
        if task.assignee_id:
            send_task_assignment_notification(task)

    def perform_update(self, serializer):
        previous_assignee_id = self.get_object().assignee_id
        task = serializer.save()
        if task.assignee_id and task.assignee_id != previous_assignee_id:
            send_task_assignment_notification(task)

    @extend_schema(
        description="Взять задачу в работу (назначить исполнителя и перевести в IN_PROGRESS)",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "integer",
                        "description": "ID исполнителя"
                    }
                },
                "required": ["user_id"]
            }
        },
        responses={
            200: TaskSerializer,
            400: OpenApiTypes.OBJECT,
            404: OpenApiTypes.OBJECT
        },
        examples=[
            OpenApiExample(
                'Пример запроса',
                value={
                    'user_id': 1
                },
                request_only=True,
            ),
        ],
    )
    @action(detail=True, methods=['patch'], url_path='take')
    def take_task(self, request, stage_id=None, pk=None):
        task = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {"error": "Не указан user_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.assignee_id = user_id
        task.status = 'IN_PROGRESS'
        task.save()
        send_task_assignment_notification(task)

        return Response(TaskSerializer(task).data)

    @extend_schema(
        description="Отметить задачу как выполненную (перевести в DONE)",
        request=None,  # Нет тела запроса
        responses={
            200: TaskSerializer,
            404: OpenApiTypes.OBJECT
        },
        examples=[
            OpenApiExample(
                'Пример запроса',
                value={},  # Пустое тело
                request_only=True,
            ),
        ],
    )
    @action(detail=True, methods=['patch'], url_path='complete')
    def complete_task(self, request, stage_id=None, pk=None):
        task = self.get_object()
        task.status = 'DONE'
        task.save()

        return Response(TaskSerializer(task).data)
