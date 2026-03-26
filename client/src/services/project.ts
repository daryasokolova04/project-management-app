import api from './api';
import { Payment } from './payment';

export interface Project {
  project_id: number;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customer: number;
  customer_name: string;
  created_at: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customer?: number; 
}

export const projectAPI = {
  getProjects: () => api.get<Project[]>('/projects/'),

  getProject: (id: number) => api.get<Project>(`/projects/${id}/`),

  createProject: (data: CreateProjectData) => api.post<Project>('/projects/', data),

  updateProject: (id: number, data: Partial<CreateProjectData>) => 
    api.put<Project>(`/projects/${id}/`, data),

	patchProject: (id: number, data: Partial<CreateProjectData>) => 
    api.patch<Project>(`/projects/${id}/`, data),

  deleteProject: (id: number) => api.delete(`/projects/${id}/`),

	getProjectPayments: (projectId: number) => 
    api.get<Payment[]>(`/projects/${projectId}/payments/`),
};