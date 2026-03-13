from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'stage', 'assignee', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'stage__project']
    search_fields = ['title', 'description']
    list_editable = ['status']
    raw_id_fields = ['assignee']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'stage')
        }),
        ('Статус и исполнитель', {
            'fields': ('status', 'assignee')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at']