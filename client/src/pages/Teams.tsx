import AddMemberModal from 'src/components/AddMemberModal';
import TeamModal from 'src/components/TeamModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { authAPI } from 'src/services/auth';
import { Project, projectAPI } from 'src/services/project';
import { AddMemberData, CreateTeamData, Team, teamAPI } from 'src/services/team';
import './Teams.css';

interface User {
  id: number;
  username: string;
  role?: string;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  // Загружаем текущего пользователя
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authAPI.getProfile();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Загружаем проекты текущего пользователя
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.getProjects();
        // Если пользователь админ, показываем все проекты, иначе только свои
        const userProjects = currentUser?.role === 'ADMIN' 
          ? response.data 
          : response.data.filter(p => p.customer === currentUser?.id);
        setProjects(userProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  // Загружаем команды
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamAPI.getTeams();
      setTeams(response.data);
    } catch (err) {
      setError('Не удалось загрузить команды');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Проверка, может ли пользователь редактировать команду
  const canEditTeam = useCallback((team: Team) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    
    // Находим проект команды и проверяем, принадлежит ли он текущему пользователю
    const project = projects.find(p => p.project_id === team.project);
    return project?.customer === currentUser.id;
  }, [currentUser, projects]);

  // Фильтруем команды для отображения (все, но с пометкой)
  const teamsWithPermissions = useMemo(() => {
    return teams.map(team => ({
      ...team,
      canEdit: canEditTeam(team)
    }));
  }, [teams, canEditTeam]);

  const handleCreateTeam = async (data: CreateTeamData) => {
    try {
      await teamAPI.createTeam(data);
      await fetchTeams();
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Error creating team:', err);
      throw err;
    }
  };

  const handleUpdateTeam = async (teamId: number, data: Partial<CreateTeamData>) => {
    try {
      await teamAPI.updateTeam(teamId, data);
      await fetchTeams();
      setSelectedTeam(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating team:', err);
      throw err;
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    const team = teams.find(t => t.team_id === teamId);
    if (!team) return;
    
    if (!canEditTeam(team)) {
      setError('Вы можете удалять только команды своих проектов');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить эту команду?')) {
      try {
        await teamAPI.deleteTeam(teamId);
        await fetchTeams();
      } catch (err) {
        console.error('Error deleting team:', err);
        setError('Не удалось удалить команду');
      }
    }
  };

  const handleAddMember = async (teamId: number, data: AddMemberData) => {
    try {
      await teamAPI.addMember(teamId, data);
      await fetchTeams();
      setShowAddMemberModal(false);
    } catch (err) {
      console.error('Error adding member:', err);
      throw err;
    }
  };

  const handleRemoveMember = async (teamId: number, userId: number) => {
    const team = teams.find(t => t.team_id === teamId);
    if (!team) return;
    
    if (!canEditTeam(team)) {
      setError('Вы можете удалять участников только в командах своих проектов');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить участника из команды?')) {
      try {
        await teamAPI.removeMember(teamId, userId);
        await fetchTeams();
      } catch (err) {
        console.error('Error removing member:', err);
        setError('Не удалось удалить участника');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { variant: string; text: string }> = {
      'PROJECT_MANAGER': { variant: 'primary', text: 'Project Manager' },
      'DEVELOPER': { variant: 'success', text: 'Developer' },
      'DESIGNER': { variant: 'info', text: 'Designer' },
      'TESTER': { variant: 'warning', text: 'Tester' },
      'OTHER': { variant: 'secondary', text: 'Other' },
    };
    const roleInfo = roleMap[role] || { variant: 'light', text: role };
    return <Badge bg={roleInfo.variant} className='roleinfo'>{roleInfo.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <Container className="teams-container text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка команд...</p>
      </Container>
    );
  }

  return (
    <Container className="teams-container">
      <div className="teams-header">
        <h1 className="teams-title">
          Управление командами
        </h1>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
          disabled={projects.length === 0}
          title={projects.length === 0 ? "Сначала создайте проект" : ""}
        >
          + Создать команду
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {teamsWithPermissions.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">👥</div>
            <h3>Нет команд</h3>
            <p className="text-muted">
              {projects.length === 0 
                ? 'Сначала создайте проект'
                : 'Создайте первую команду для проекта'}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <div className="teams-list">
          {teamsWithPermissions.map((team) => (
            <Card key={team.team_id} className="team-card mb-4">
              <Card.Header className="team-card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="team-name mb-1">
                      {team.name}
                    </h5>
                    <div className="team-project">
                      Проект: <strong>{team.project_title}</strong>
                    </div>
                  </div>
                  <div className="team-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => setExpandedTeamId(expandedTeamId === team.team_id ? null : team.team_id)}
                    >
                      {expandedTeamId === team.team_id ? 'Скрыть' : 'Участники'} ({team.member_count})
                    </Button>
                    
                    {team.canEdit && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowAddMemberModal(true);
                          }}
                        >
                          + Добавить участника
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowEditModal(true);
                          }}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.team_id)}
                        >
                          Удалить
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card.Header>
              
              {expandedTeamId === team.team_id && (
                <Card.Body>
                  <h6 className="members-title">Участники команды</h6>
                  {team.members && team.members.length > 0 ? (
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr>
                          <th>Пользователь</th>
                          <th>Email</th>
                          <th>Роль в системе</th>
                          <th>Роль в команде</th>
                          <th>Дата</th>
                          {team.canEdit && <th>Действия</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {team.members.map((member) => (
                          <tr key={member.team_member_id}>
                            <td>{member.user_username}</td>
                            <td>{member.user_email}</td>
                            <td>
                              <Badge bg="secondary">{member.user_role}</Badge>
                            </td>
                            <td>{getRoleBadge(member.role_in_team)}</td>
                            <td>{formatDate(member.joined_at)}</td>
                            {team.canEdit && (
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveMember(team.team_id, member.user)}
                                >
                                  Удалить
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted text-center">Нет участников</p>
                  )}
                </Card.Body>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <TeamModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateTeam}
        team={null}
        projects={projects}
        currentUser={currentUser}
      />

      {selectedTeam && (
        <TeamModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedTeam(null);
          }}
          onSubmit={(data) => handleUpdateTeam(selectedTeam.team_id, data)}
          team={selectedTeam}
          projects={projects}
          currentUser={currentUser}
        />
      )}

      {selectedTeam && (
        <AddMemberModal
          show={showAddMemberModal}
          onHide={() => {
            setShowAddMemberModal(false);
            setSelectedTeam(null);
          }}
          onSubmit={(data) => handleAddMember(selectedTeam.team_id, data)}
          team={selectedTeam}
        />
      )}
    </Container>
  );
};

export default Teams;