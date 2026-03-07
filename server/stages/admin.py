from django.contrib import admin
from .models import ProjectStage

@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'status', 'order_index']
    list_filter = ['status', 'project']
    list_display_links = ['name']
    
    # Отображение этапов только для проектов текущего пользователя (опционально)
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_staff:
            return qs.filter(project__customer=request.user)
        return qs
