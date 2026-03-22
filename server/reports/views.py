from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils.dateparse import parse_date
from rest_framework import permissions
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rest_framework.views import APIView
from project_access import projects_queryset_for_user, user_can_access_project
from project_management.models import Project, ProjectStage, PaymentRecord, Task
from .serializers import (
    UserProjectReportSerializer,
    PaymentRecordItemSerializer,
    ProjectStageReportSerializer,
)


class UserProjectReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filter by project status.',
            ),
            OpenApiParameter(
                name='date_from',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filter by deadline from (YYYY-MM-DD).',
            ),
            OpenApiParameter(
                name='date_to',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filter by deadline to (YYYY-MM-DD).',
            ),
        ],
        responses=UserProjectReportSerializer,
    )
    def get(self, request):
        queryset = projects_queryset_for_user(request.user)

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        date_from = request.query_params.get('date_from')
        if date_from:
            parsed = parse_date(date_from)
            if not parsed:
                raise ValidationError({'date_from': 'Invalid date format. Use YYYY-MM-DD.'})
            queryset = queryset.filter(deadline__gte=parsed)

        date_to = request.query_params.get('date_to')
        if date_to:
            parsed = parse_date(date_to)
            if not parsed:
                raise ValidationError({'date_to': 'Invalid date format. Use YYYY-MM-DD.'})
            queryset = queryset.filter(deadline__lte=parsed)

        queryset = queryset.annotate(
            total_stages=Count('stages', distinct=True),
            completed_stages=Count(
                'stages',
                filter=Q(stages__status=ProjectStage.Status.DONE),
                distinct=True,
            ),
        ).order_by('-deadline', 'project_id')

        serializer = UserProjectReportSerializer(queryset, many=True)
        return Response(serializer.data)


class ProjectFinanceReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='date_from',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filter payments by created_at from (YYYY-MM-DD).',
            ),
            OpenApiParameter(
                name='date_to',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filter payments by created_at to (YYYY-MM-DD).',
            ),
        ],
        responses=PaymentRecordItemSerializer,
    )
    def get(self, request, project_id):
        try:
            project = Project.objects.get(project_id=project_id)
        except Project.DoesNotExist:
            raise NotFound('Project not found')

        if not user_can_access_project(request.user, project):
            raise NotFound('Project not found')

        payments_qs = PaymentRecord.objects.filter(project_id=project_id)

        date_from = request.query_params.get('date_from')
        if date_from:
            parsed = parse_date(date_from)
            if not parsed:
                raise ValidationError({'date_from': 'Invalid date format. Use YYYY-MM-DD.'})
            payments_qs = payments_qs.filter(created_at__date__gte=parsed)

        date_to = request.query_params.get('date_to')
        if date_to:
            parsed = parse_date(date_to)
            if not parsed:
                raise ValidationError({'date_to': 'Invalid date format. Use YYYY-MM-DD.'})
            payments_qs = payments_qs.filter(created_at__date__lte=parsed)

        payments_qs = payments_qs.order_by('created_at')
        payments = PaymentRecordItemSerializer(payments_qs, many=True).data

        totals = payments_qs.aggregate(
            total_payment=Sum('amount', filter=Q(type=PaymentRecord.Type.PAYMENT)),
            total_refund=Sum('amount', filter=Q(type=PaymentRecord.Type.REFUND)),
        )
        total_payment = totals.get('total_payment') or Decimal('0')
        total_refund = totals.get('total_refund') or Decimal('0')

        balance = project.budget - total_payment + total_refund

        return Response({
            'payments': payments,
            'summary': {
                'total_budget': project.budget,
                'payment_amount': total_payment,
                'refund_amount': total_refund,
                'balance': balance,
            }
        })


class ProjectStageReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(project_id=project_id)
        except Project.DoesNotExist:
            raise NotFound('Project not found')

        if not user_can_access_project(request.user, project):
            raise NotFound('Project not found')

        stages = ProjectStage.objects.filter(project_id=project_id).annotate(
            total_tasks=Count('tasks', distinct=True),
            completed_tasks=Count(
                'tasks',
                filter=Q(tasks__status=Task.Status.DONE),
                distinct=True,
            ),
        ).order_by('order_index', 'project_stage_id')

        serializer = ProjectStageReportSerializer(stages, many=True)
        return Response(serializer.data)
