import api from './api';

export interface Payment {
  payment_record_id: number;
  amount: string;
  description: string;
  type: 'BUDGET' | 'EXPENSE' | 'MILESTONE' | 'OTHER';
  project: number;
  project_title?: string;
  created_at: string;
}

export interface CreatePaymentData {
  amount: string;
  description: string;
  type: 'BUDGET' | 'EXPENSE' | 'MILESTONE' | 'OTHER';
  project: number;
}

export const paymentAPI = {
	getProjectPayments: (projectId: number) => 
    api.get<Payment[]>(`/projects/${projectId}/payments/`),

  createPayment: (data: CreatePaymentData) => api.post<Payment>('/payments/', data),
};