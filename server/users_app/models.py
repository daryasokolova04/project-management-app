from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        FREELANCER = "FREELANCER", "Freelancer"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.CUSTOMER,
    )
    competencies = models.TextField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    email = models.EmailField(unique=True)

    def __str__(self) -> str:
        return self.username or self.email
