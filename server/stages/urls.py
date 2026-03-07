from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectStageViewSet

router = DefaultRouter()
router.register(r'', ProjectStageViewSet, basename='projectstage')

urlpatterns = [
    path('', include(router.urls)),
]
