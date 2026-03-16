import api from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'CUSTOMER' | 'FREELANCER' | 'ADMIN';
  competencies: string | null;
  portfolio: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: 'CUSTOMER' | 'FREELANCER';
  competencies?: string;
  portfolio?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authAPI = {
	login: async (data: LoginRequest): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>('/users/login/', data);
		return response.data;
	},

	register: async (data: RegisterRequest): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>('/users/register/', data);
		return response.data;
	},

	getProfile: async (): Promise<User> => {
		const response = await api.get<User>('/users/me/');
		return response.data;
	},

	getUsers: async (): Promise<User[]> => {
		const response = await api.get<User[]>('/users/');
		return response.data;
	},
};