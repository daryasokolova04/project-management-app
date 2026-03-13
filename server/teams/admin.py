from django.contrib import admin
from .models import Team, TeamMember


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 1
    fields = ['user', 'role_in_team', 'joined_at']
    readonly_fields = ['joined_at']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'member_count', 'created_at']
    list_filter = ['project__status', 'created_at']
    search_fields = ['name', 'project__title']
    inlines = [TeamMemberInline]
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Участников'


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['team', 'user', 'role_in_team', 'joined_at']
    list_filter = ['role_in_team', 'joined_at']
    search_fields = ['team__name', 'user__username', 'user__email']