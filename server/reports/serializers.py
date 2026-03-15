from rest_framework import serializers
from project_management.models import Project, PaymentRecord, ProjectStage


class UserProjectReportSerializer(serializers.ModelSerializer):
    total_stages = serializers.IntegerField(read_only=True)
    completed_stages = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'project_id', 'title', 'budget', 'deadline', 'status',
            'total_stages', 'completed_stages'
        ]


class PaymentRecordItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRecord
        fields = [
            'payment_record_id', 'created_at', 'type', 'description', 'amount'
        ]


class ProjectStageReportSerializer(serializers.ModelSerializer):
    total_tasks = serializers.IntegerField(read_only=True)
    completed_tasks = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProjectStage
        fields = [
            'project_stage_id', 'name', 'description', 'order_index', 'status',
            'total_tasks', 'completed_tasks'
        ]
