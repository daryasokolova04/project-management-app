from django.urls import path
from .views import PaymentRecordViewSet


project_payments = PaymentRecordViewSet.as_view({
    'get': 'list'
})

payment_create = PaymentRecordViewSet.as_view({
    'post': 'create'
})

urlpatterns = [
    path('projects/<int:project_id>/payments/', project_payments, name='project-payments-list'),
    path('payments/', payment_create, name='payment-create'),
]
