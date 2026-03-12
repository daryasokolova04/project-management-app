from django.db import models
from users_app.models import User
from projects.models import Project


class Team(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название команды")
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='teams',
        verbose_name="Проект"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        verbose_name = "Команда"
        verbose_name_plural = "Команды"

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    class Role(models.TextChoices):
        DEVELOPER = "DEVELOPER", "Developer"
        TESTER = "TESTER", "Tester"
        LEAD = "LEAD", "Lead"

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name="Команда"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='team_memberships',
        verbose_name="Пользователь"
    )
    role_in_team = models.CharField(
        max_length=20,
        choices=Role.choices,
        verbose_name="Роль в команде"
    )
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        unique_together = ['team', 'user']  
        verbose_name = "Участник команды"
        verbose_name_plural = "Участники команд"

    def __str__(self):
        return f"{self.team.name}: {self.user.username} ({self.role_in_team})"