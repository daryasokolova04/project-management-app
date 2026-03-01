from django.db import models

class User(models.Model):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'
        FREELANCER = 'FREELANCER', 'Freelancer'
        ADMIN = 'ADMIN', 'Administrator'
    user_id = models.BigAutoField(primary_key=True, db_column="user_id")
    email = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    password_hash = models.TextField()
    role = models.CharField(
        max_length=255,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )

    class Meta:
        db_table = "users"
        managed = False

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Project(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    project_id = models.BigAutoField(primary_key=True, db_column="project_id")
    budget = models.DecimalField(max_digits=20, decimal_places=2)
    deadline = models.DateField()
    description = models.CharField(max_length=1000, null=True, blank=True)
    status = models.CharField(
        max_length=255,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    title = models.CharField(max_length=255)
    customer = models.ForeignKey(
        User,
        on_delete=models.RESTRICT,
        db_column="customer_id",
        to_field="user_id",
        related_name="projects",
    )

    class Meta:
        db_table = "projects"
        managed = False

    def __str__(self) -> str:
        return self.title


class PaymentRecord(models.Model):
    class Type(models.TextChoices):
        BUDGET = 'BUDGET', 'Budget Allocation'
        PAYMENT = 'PAYMENT', 'Payment'
        REFUND = 'REFUND', 'Refund'
    payment_record_id = models.BigAutoField(primary_key=True, db_column="payment_record_id")
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    created_at = models.DateTimeField()
    description = models.TextField(null=True, blank=True)
    type = models.CharField(
        max_length=255,
        choices=Type.choices,
        default=Type.PAYMENT,
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.RESTRICT,
        db_column="project_id",
        to_field="project_id",
        related_name="payment_records",
    )

    class Meta:
        db_table = "payment_records"
        managed = False

    def __str__(self) -> str:
        return f"{self.type}: {self.amount}"


class ProjectStage(models.Model):
    class Status(models.TextChoices):
        OPEN = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'
    project_stage_id = models.BigAutoField(primary_key=True, db_column="project_stage_id")
    description = models.TextField(null=True, blank=True)
    name = models.CharField(max_length=255)
    order_index = models.IntegerField()
    status = models.CharField(
        max_length=255,
        choices=Status.choices,
        default=Status.OPEN,
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.RESTRICT,
        db_column="project_id",
        to_field="project_id",
        related_name="stages",
    )

    class Meta:
        db_table = "project_stages"
        managed = False

    def __str__(self) -> str:
        return f"{self.project.title}: {self.name}"


class Team(models.Model):
    team_id = models.BigAutoField(primary_key=True, db_column="team_id")
    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        Project,
        on_delete=models.RESTRICT,
        db_column="project_id",
        to_field="project_id",
        related_name="teams",
    )

    members = models.ManyToManyField(
        User,
        through='TeamMember',
        through_fields=('team', 'user'),
        related_name='teams'
    )

    class Meta:
        db_table = "teams"
        managed = False

    def __str__(self) -> str:
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'
    task_id = models.BigAutoField(primary_key=True, db_column="task_id")
    description = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=255,
        choices=Status.choices,
        default=Status.OPEN,
    )
    title = models.CharField(max_length=255)
    assignee = models.ForeignKey(
        User,
        on_delete=models.RESTRICT,
        db_column="assignee_id",
        to_field="user_id",
        null=True,
        blank=True,
        related_name="tasks",
    )
    stage = models.ForeignKey(
        ProjectStage,
        on_delete=models.RESTRICT,
        db_column="stage_id",
        to_field="project_stage_id",
        related_name="tasks",
    )

    class Meta:
        db_table = "tasks"
        managed = False

    def __str__(self) -> str:
        return self.title


class TeamMember(models.Model):
    team_member_id = models.BigAutoField(primary_key=True, db_column="team_member_id")
    role_in_team = models.CharField(max_length=255)
    team = models.ForeignKey(
        Team,
        on_delete=models.RESTRICT,
        db_column="team_id",
        to_field="team_id",
        related_name="membership_details",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.RESTRICT,
        db_column="user_id",
        to_field="user_id",
        related_name="team_memberships",
    )

    class Meta:
        db_table = "team_members"
        managed = False
        unique_together = [['team', 'user']]

    def __str__(self) -> str:
        return f"{self.team.name}: {self.user.name} ({self.role_in_team})"
