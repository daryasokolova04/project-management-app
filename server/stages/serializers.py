from rest_framework import serializers
from .models import ProjectStage

class ProjectStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStage
        fields = '__all__'
