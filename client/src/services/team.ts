import api from './api';

export interface TeamMember {
  team_member_id: number;
  team: number;
  user: number;
  user_username: string;
  user_email: string;
  user_role: 'CUSTOMER' | 'FREELANCER' | 'ADMIN';
  role_in_team: 'PROJECT_MANAGER' | 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'OTHER';
  joined_at: string;
}

export interface Team {
  team_id: number;
  name: string;
  project: number;
  project_title: string;
  members: TeamMember[];
  member_count: string;
  created_at: string;
}

export interface CreateTeamData {
  name: string;
  project: number;
}

export interface AddMemberData {
  user_id: number;
  role_in_team: 'DEVELOPER' | 'TESTER' | 'LEAD';
}

export const teamAPI = {
  getTeams: () => api.get<Team[]>('/teams/teams/'),

  getTeam: (teamId: number) => api.get<Team>(`/teams/teams/${teamId}/`),

  createTeam: (data: CreateTeamData) => api.post<Team>('/teams/teams/', data),
	
  updateTeam: (teamId: number, data: Partial<CreateTeamData>) => 
    api.put<Team>(`/teams/teams/${teamId}/`, data),

	patchTeam: (teamId: number, data: Partial<CreateTeamData>) => 
    api.patch<Team>(`/teams/teams/${teamId}/`, data),

  deleteTeam: (teamId: number) => api.delete(`/teams/teams/${teamId}/`),
  
  addMember: (teamId: number, data: AddMemberData) => 
    api.post<TeamMember>(`/teams/teams/${teamId}/members/`, data),

  removeMember: (teamId: number, userId: number) => 
    api.delete(`/teams/teams/${teamId}/members/${userId}/`),
};