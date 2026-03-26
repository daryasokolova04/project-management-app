from django.urls import path
from .views import TaskViewSet

urlpatterns = [
    path('stages/<int:stage_id>/tasks/', TaskViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='stage-tasks-list'),
    
    path('stages/<int:stage_id>/tasks/<int:pk>/', TaskViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='stage-tasks-detail'),
    
    path('stages/<int:stage_id>/tasks/<int:pk>/take/', TaskViewSet.as_view({
        'patch': 'take_task'
    }), name='stage-tasks-take'),
    
    path('stages/<int:stage_id>/tasks/<int:pk>/complete/', TaskViewSet.as_view({
        'patch': 'complete_task'
    }), name='stage-tasks-complete'),
]