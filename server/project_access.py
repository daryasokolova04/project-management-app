"""
Правила доступа к проектам/командам по ролям.

FREELANCER видит только проекты и команды, где есть запись в team_members.
ADMIN / staff / superuser — полный доступ.
CUSTOMER — свои проекты и команды этих проектов.
"""

from __future__ import annotations

from typing import Optional

from django.db.models import QuerySet

from project_management.models import Project, Team, TeamMember


def _normalized_role(user) -> Optional[str]:
    """Роль из БД может отличаться регистром или пробелами."""
    r = getattr(user, "role", None)
    if r is None or r == "":
        return None
    return str(r).strip().upper()


def is_platform_admin(user) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
        return True
    return _normalized_role(user) == "ADMIN"


def is_freelancer(user) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return _normalized_role(user) == "FREELANCER"


def _freelancer_team_ids(user):
    return TeamMember.objects.filter(user=user).values_list("team_id", flat=True)


def projects_queryset_for_user(user) -> QuerySet[Project]:
    if is_platform_admin(user):
        return Project.objects.all()
    if is_freelancer(user):
        # Прямой запрос по team_members надёжнее M2M teams__members при unmanaged-моделях
        project_ids = (
            TeamMember.objects.filter(user=user)
            .values_list("team__project_id", flat=True)
            .distinct()
        )
        return Project.objects.filter(project_id__in=project_ids)
    return Project.objects.filter(customer=user)


def user_can_access_project(user, project: Project) -> bool:
    if is_platform_admin(user):
        return True
    if is_freelancer(user):
        pid = getattr(project, "project_id", None) or project.pk
        return TeamMember.objects.filter(user=user, team__project_id=pid).exists()
    return project.customer_id == getattr(user, "pk", None)


def teams_queryset_for_user(user) -> QuerySet[Team]:
    qs = Team.objects.all().select_related("project").prefetch_related("membership_details__user")
    if is_platform_admin(user):
        return qs
    if is_freelancer(user):
        team_ids = _freelancer_team_ids(user)
        return qs.filter(team_id__in=team_ids).distinct()
    return qs.filter(project__customer=user)
