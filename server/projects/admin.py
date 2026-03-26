from django.contrib import admin

from stages.models import ProjectStage
from .models import Project

class ProjectStageInline(admin.TabularInline):
    model = ProjectStage
    extra = 1
    ordering = ['order_index']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'budget', 'deadline', 'customer']
    list_filter = ['status', 'created_at']
    inlines = [ProjectStageInline]  # Этапы редактируются прямо в проекте
