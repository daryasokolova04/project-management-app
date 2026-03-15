from django.urls import path
from .views import UserProjectReportView, ProjectFinanceReportView, ProjectStageReportView


urlpatterns = [
    path('reports/user-projects/', UserProjectReportView.as_view(), name='report-user-projects'),
    path('reports/project-finance/<int:project_id>/', ProjectFinanceReportView.as_view(), name='report-project-finance'),
    path('reports/project-stages/<int:project_id>/', ProjectStageReportView.as_view(), name='report-project-stages'),
]
