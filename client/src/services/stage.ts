import api from './api';

export interface Stage {
  project_stage_id: number;
  name: string;
  description: string;
  order_index: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  project: number;
  project_title?: string;
}

export interface CreateStageData {
  name: string;
  description: string;
  order_index: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  project: number;
}

export interface Task {
  task_id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  status_display: string;
  stage: number;
  stage_name: string;
  stage_project: string;
  assignee?: number;
  assignee_username?: string;
  assignee_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assignee?: number;
}

export const stageAPI = {
  // Stages
  getStages: (projectId: number) => 
    api.get<Stage[]>(`/stages/?project_id=${projectId}`),
	
  getStage: (id: number) => api.get<Stage>(`/stages/${id}/`),

  createStage: (data: CreateStageData) => api.post<Stage>('/stages/', data),

  updateStage: (id: number, data: Partial<CreateStageData>) => 
    api.put<Stage>(`/stages/${id}/`, data),

	patchStage: (id: number, data: Partial<CreateStageData>) => 
    api.patch<Stage>(`/stages/${id}/`, data),

  deleteStage: (id: number) => api.delete(`/stages/${id}/`),

  // Tasks
  getTasks: (stageId: number, assignee?: number, status?: string) => {
    let url = `/stages/${stageId}/tasks/`;
    const params = new URLSearchParams();
    if (assignee) params.append('assignee', assignee.toString());
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get<Task[]>(url);
  },

  createTask: (stageId: number, data: CreateTaskData) => 
    api.post<Task>(`/stages/${stageId}/tasks/`, data),

  getTask: (stageId: number, taskId: number) => 
    api.get<Task>(`/stages/${stageId}/tasks/${taskId}/`),

  updateTask: (stageId: number, taskId: number, data: Partial<CreateTaskData>) => 
    api.put<Task>(`/stages/${stageId}/tasks/${taskId}/`, data),

	patchTask: (stageId: number, taskId: number, data: Partial<CreateTaskData>) => 
    api.patch<Task>(`/stages/${stageId}/tasks/${taskId}/`, data),

  deleteTask: (stageId: number, taskId: number) => 
    api.delete(`/stages/${stageId}/tasks/${taskId}/`),

  completeTask: (stageId: number, taskId: number) => 
    api.patch<Task>(`/stages/${stageId}/tasks/${taskId}/complete/`),

  takeTask: (stageId: number, taskId: number, userId: number) => 
    api.patch<Task>(`/stages/${stageId}/tasks/${taskId}/take/`, { user_id: userId }),
};