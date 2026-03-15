from rest_framework import serializers
from project_management.models import PaymentRecord


class PaymentRecordSerializer(serializers.ModelSerializer):
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = PaymentRecord
        fields = [
            'payment_record_id', 'amount', 'created_at', 'description',
            'type', 'project', 'project_title'
        ]
        read_only_fields = ['payment_record_id', 'created_at']
