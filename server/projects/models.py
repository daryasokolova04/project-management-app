from django.db import models

from users_app.models import User

class Project(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Черновик'),
        ('PUBLISHED', 'Опубликовано'),
        ('IN_PROGRESS', 'В работе'),
        ('COMPLETED', 'Завершено'),
        ('CANCELLED', 'Отменено'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=20, decimal_places=2)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
