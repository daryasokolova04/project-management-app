"""
Правила доступа к проектам/командам по ролям.

FREELANCER видит только проекты и команды, где он состоит в команде (Team.members).
ADMIN / staff — полный доступ.
CUSTOMER — свои проекты и команды этих проектов.
"""

from __future__ import annotations

from django.db.models import QuerySet

from project_management.models import Project, Team


def is_platform_admin(user) -> bool:
    return bool(getattr(user, "is_staff", False) or getattr(user, "role", None) == "ADMIN")


def projects_queryset_for_user(user) -> QuerySet[Project]:
    if is_platform_admin(user):
        return Project.objects.all()
    if getattr(user, "role", None) == "FREELANCER":
        return Project.objects.filter(teams__members=user).distinct()
    return Project.objects.filter(customer=user)


def user_can_access_project(user, project: Project) -> bool:
    if is_platform_admin(user):
        return True
    if getattr(user, "role", None) == "FREELANCER":
        return project.teams.filter(members=user).exists()
    return project.customer_id == getattr(user, "pk", None)


def teams_queryset_for_user(user) -> QuerySet[Team]:
    qs = Team.objects.all().select_related("project").prefetch_related("membership_details__user")
    if is_platform_admin(user):
        return qs
    if getattr(user, "role", None) == "FREELANCER":
        return qs.filter(members=user).distinct()
    return qs.filter(project__customer=user)
