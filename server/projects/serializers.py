from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    customer_name = serializers.ReadOnlyField(source='customer.username')
    
    class Meta:
        model = Project
        fields = '__all__'
