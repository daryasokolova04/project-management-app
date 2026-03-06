from django.db import models

from projects.models import Project

class ProjectStage(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Открыт'),
        ('IN_PROGRESS', 'В работе'),
        ('DONE', 'Выполнен'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    order_index = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='stages')
    
    class Meta:
        ordering = ['order_index']
        unique_together = ['project', 'order_index']
