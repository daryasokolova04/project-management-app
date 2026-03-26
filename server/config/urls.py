from django.contrib import admin
from django.urls import include, path

from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as drf_authtoken_views
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from users_app.views import UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path('api/projects/', include('projects.urls')),
    path('api/stages/', include('stages.urls')),
	path('api/teams/', include('teams.urls')), 
	path('api/', include('tasks.urls')),
    path('api/', include('finance.urls')),
    path('api/', include('reports.urls')),
    path("api/auth/token/", drf_authtoken_views.obtain_auth_token, name="api-token-auth"),

    # Swagger/OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

]
