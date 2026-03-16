import api from './api';

export interface ProjectFinanceReport {
  payment_record_id: number;
  created_at: string;
  type: string;
  description: string;
  amount: string;
}

export interface ProjectStageReport {
  project_stage_id: number;
  name: string;
  status: string;
  order_index: number;
  task_count?: number;
  completed_tasks?: number;
}

export interface UserProjectReport {
  project_id: number;
  title: string;
  budget: string;
  deadline: string;
  status: string;
  total_stages: number;
  completed_stages: number;
}

export const reportAPI = {
  getProjectFinance: (projectId: number, dateFrom?: string, dateTo?: string) => {
    let url = `/reports/project-finance/${projectId}/`;
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get<ProjectFinanceReport[]>(url);
  },

  getProjectStages: (projectId: number) => 
    api.get<ProjectStageReport[]>(`/reports/project-stages/${projectId}/`),

  getUserProjects: (dateFrom?: string, dateTo?: string, status?: string) => {
    let url = '/reports/user-projects/';
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get<UserProjectReport[]>(url);
  },
};