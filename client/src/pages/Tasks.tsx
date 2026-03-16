import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import TaskModal from '../components/TaskModal';
import './Tasks.css';
import { authAPI } from 'src/services/auth';
import { Project, projectAPI } from 'src/services/project';
import { Task, Stage, stageAPI, CreateTaskData } from 'src/services/stage';
import { Team, teamAPI } from 'src/services/team';

interface User {
  id: number;
  username: string;
  email: string;
  role_in_team?: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Фильтры
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');

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
        // Фильтруем только проекты текущего пользователя
        const myProjects = response.data.filter(p => p.customer === currentUser?.id);
        setProjects(myProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  // Загружаем команды для выбранного проекта
  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedProjectId) {
        setTeams([]);
        setTeamMembers([]);
        return;
      }

      try {
        const response = await teamAPI.getTeams();
        // Фильтруем команды для выбранного проекта
        const projectTeams = response.data.filter(team => team.project === parseInt(selectedProjectId));
        setTeams(projectTeams);
        
        // Собираем всех участников из всех команд проекта
        const members: User[] = [];
        projectTeams.forEach(team => {
          if (team.members) {
            team.members.forEach(member => {
              members.push({
                id: member.user,
                username: member.user_username,
                email: member.user_email,
                role_in_team: member.role_in_team
              });
            });
          }
        });
        
        // Убираем дубликаты (один пользователь может быть в нескольких командах)
        const uniqueMembers = Array.from(
          new Map(members.map(m => [m.id, m])).values()
        );
        
        setTeamMembers(uniqueMembers);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    fetchTeams();
  }, [selectedProjectId]);

  // Загружаем этапы при выборе проекта
  useEffect(() => {
    const fetchStages = async () => {
      if (!selectedProjectId) {
        setStages([]);
        return;
      }

      setLoadingStages(true);
      try {
        const response = await stageAPI.getStages(parseInt(selectedProjectId));
        setStages(response.data);
      } catch (err) {
        console.error('Error fetching stages:', err);
      } finally {
        setLoadingStages(false);
      }
    };

    fetchStages();
  }, [selectedProjectId]);

  // Загружаем задачи при изменении фильтров
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedStageId) {
        setTasks([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await stageAPI.getTasks(
          parseInt(selectedStageId),
          assigneeFilter ? parseInt(assigneeFilter) : undefined,
          statusFilter || undefined
        );
        setTasks(response.data);
      } catch (err) {
        setError('Не удалось загрузить задачи');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedStageId, statusFilter, assigneeFilter]);

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      if (selectedStageId) {
        await stageAPI.createTask(parseInt(selectedStageId), data);
        await fetchTasksWithCurrentFilters();
        setShowModal(false);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTask = async (taskId: number, data: Partial<CreateTaskData>) => {
    try {
      if (selectedStageId) {
        await stageAPI.updateTask(parseInt(selectedStageId), taskId, data);
        await fetchTasksWithCurrentFilters();
        setSelectedTask(null);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        if (selectedStageId) {
          await stageAPI.deleteTask(parseInt(selectedStageId), taskId);
          await fetchTasksWithCurrentFilters();
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Не удалось удалить задачу');
      }
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      if (selectedStageId) {
        await stageAPI.completeTask(parseInt(selectedStageId), taskId);
        await fetchTasksWithCurrentFilters();
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const fetchTasksWithCurrentFilters = async () => {
    if (selectedStageId) {
      const response = await stageAPI.getTasks(
        parseInt(selectedStageId),
        assigneeFilter ? parseInt(assigneeFilter) : undefined,
        statusFilter || undefined
      );
      setTasks(response.data);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      'OPEN': { variant: 'secondary', text: 'Открыта' },
      'IN_PROGRESS': { variant: 'warning', text: 'В работе' },
      'DONE': { variant: 'success', text: 'Завершена' },
    };
    const statusInfo = statusMap[status] || { variant: 'light', text: status };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Сброс фильтров при смене проекта
  useEffect(() => {
    setSelectedStageId('');
    setStatusFilter('');
    setAssigneeFilter('');
  }, [selectedProjectId]);

  if (!currentUser) {
    return (
      <Container className="tasks-container text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="tasks-container">
      <div className="tasks-header">
        <h1 className="tasks-title">Управление задачами</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          disabled={!selectedStageId}
        >
          + Создать задачу
        </Button>
      </div>

      <Card className="filters-card mb-4">
        <Card.Body>
          <h5 className="filters-title">Фильтры</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Проект</Form.Label>
                <Form.Select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Выберите проект</option>
                  {projects.map(project => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Этап *</Form.Label>
                <Form.Select 
                  value={selectedStageId} 
                  onChange={(e) => setSelectedStageId(e.target.value)}
                  disabled={!selectedProjectId || loadingStages}
                  required
                >
                  <option value="">Выберите этап</option>
                  {stages.map(stage => (
                    <option key={stage.project_stage_id} value={stage.project_stage_id}>
                      {stage.name} (порядок: {stage.order_index})
                    </option>
                  ))}
                </Form.Select>
                {loadingStages && <Form.Text>Загрузка этапов...</Form.Text>}
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Статус</Form.Label>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Все</option>
                  <option value="OPEN">Открыта</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="DONE">Завершена</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {teamMembers.length > 0 && (
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Исполнитель</Form.Label>
                  <Form.Select 
                    value={assigneeFilter} 
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                  >
                    <option value="">Все</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.username} {member.role_in_team ? `(${member.role_in_team})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {!selectedProjectId ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📁</div>
            <h3>Выберите проект</h3>
            <p className="text-muted">Сначала выберите проект для просмотра этапов</p>
          </Card.Body>
        </Card>
      ) : !selectedStageId ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📋</div>
            <h3>Выберите этап</h3>
            <p className="text-muted">Выберите этап для просмотра задач</p>
          </Card.Body>
        </Card>
      ) : loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Загрузка задач...</p>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">✅</div>
            <h3>Нет задач</h3>
            <p className="text-muted">Создайте первую задачу для этого этапа</p>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive className="tasks-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Исполнитель</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id}>
                <td>{task.task_id}</td>
                <td>{task.title}</td>
                <td>{task.description || '-'}</td>
                <td>{getStatusBadge(task.status)}</td>
                <td>
                  {task.assignee_username ? (
                    <div>
                      <div>{task.assignee_username}</div>
                      <small className="text-muted">{task.assignee_email}</small>
                    </div>
                  ) : (
                    <Badge bg="secondary">Не назначен</Badge>
                  )}
                </td>
                <td>{formatDate(task.created_at)}</td>
                <td>
                  {task.status !== 'DONE' && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleCompleteTask(task.task_id)}
                    >
                      Завершить
                    </Button>
                  )}
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => setSelectedTask(task)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteTask(task.task_id)}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <TaskModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleCreateTask}
        stageId={selectedStageId ? parseInt(selectedStageId) : 0}
        task={null}
        users={teamMembers}
      />

      {selectedTask && (
        <TaskModal
          show={!!selectedTask}
          onHide={() => setSelectedTask(null)}
          onSubmit={(data) => handleUpdateTask(selectedTask.task_id, data)}
          stageId={selectedTask.stage}
          task={selectedTask}
          users={teamMembers}
        />
      )}
    </Container>
  );
};

export default Tasks;