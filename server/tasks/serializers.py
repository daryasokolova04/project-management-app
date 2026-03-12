from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    stage_name = serializers.ReadOnlyField(source='stage.name')
    stage_project = serializers.ReadOnlyField(source='stage.project.title')
    assignee_username = serializers.ReadOnlyField(source='assignee.username')
    assignee_email = serializers.ReadOnlyField(source='assignee.email')
    status_display = serializers.ReadOnlyField(source='get_status_display')

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'status_display',
            'stage', 'stage_name', 'stage_project',
            'assignee', 'assignee_username', 'assignee_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'assignee']

    def validate_status(self, value):
        if value and value not in ['OPEN', 'IN_PROGRESS', 'DONE']:
            raise serializers.ValidationError("Статус должен быть OPEN, IN_PROGRESS или DONE")
        return value