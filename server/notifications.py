from django.conf import settings
from django.core.mail import send_mail


def send_project_created_notification(project):
    recipient = getattr(project.customer, "email", None)
    if not recipient:
        return

    subject = "Project created"
    message = (
        f"Your project \"{project.title}\" has been created.\n"
        f"Status: {project.status}\n"
        f"Budget: {project.budget}\n"
        f"Due date: {project.deadline}"
    )
    send_mail(
        subject,
        message,
        getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
        [recipient],
        fail_silently=True,
    )


def send_task_assignment_notification(task):
    assignee = getattr(task, "assignee", None)
    recipient = getattr(assignee, "email", None) if assignee else None
    if not recipient:
        return

    subject = "Task assigned"
    message = (
        f"You have been assigned a task: \"{task.title}\".\n"
        f"Status: {task.status}\n"
        f"Stage: {task.stage.name}"
    )
    send_mail(
        subject,
        message,
        getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
        [recipient],
        fail_silently=True,
    )
