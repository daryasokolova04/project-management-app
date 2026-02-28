from django.contrib import admin

from .models import PaymentRecord, Project, ProjectStage, Task, Team, TeamMember, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("user_id", "email", "name", "role")
    search_fields = ("email", "name", "role")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("project_id", "title", "status", "deadline", "customer")
    list_filter = ("status",)
    search_fields = ("title",)


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ("payment_record_id", "project", "amount", "type", "created_at")
    list_filter = ("type",)


@admin.register(ProjectStage)
class ProjectStageAdmin(admin.ModelAdmin):
    list_display = ("project_stage_id", "project", "name", "order_index", "status")
    list_filter = ("status",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("task_id", "title", "status", "stage", "assignee")
    list_filter = ("status",)
    search_fields = ("title",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("team_id", "name", "project")
    search_fields = ("name",)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("team_member_id", "team", "user", "role_in_team")
    list_filter = ("role_in_team",)
