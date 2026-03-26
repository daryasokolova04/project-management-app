import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authAPI } from 'src/services/auth';
import { CreateProjectData, Project, projectAPI } from 'src/services/project';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import './ProjectsList.css';

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; isAdmin?: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await authAPI.getProfile();
        setCurrentUser({ 
          id: user.id,
          isAdmin: user.role === 'ADMIN' 
        });
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    getCurrentUser();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data);
    } catch (err) {
      setError('Не удалось загрузить проекты. Пожалуйста, попробуйте позже.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: CreateProjectData & { customer?: number }) => {
    try {
      let customerId = data.customer;

      if (!customerId) {
        const user = await authAPI.getProfile();
        customerId = user.id;
        localStorage.setItem('user', JSON.stringify(user));
      }

      const projectData = {
        title: data.title,
        description: data.description || '',
        budget: data.budget,
        deadline: data.deadline,
        status: data.status || 'DRAFT',
        customer: customerId,
      };
      
      await projectAPI.createProject(projectData);
      await fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  const handleUpdateProject = async (id: number, data: Partial<CreateProjectData & { customer?: number }>) => {
    try {
      const submitData = { ...data };
      if (submitData.customer === undefined || submitData.customer === 0) {
        delete submitData.customer;
      }
      
      await projectAPI.updateProject(id, submitData);
      await fetchProjects();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await projectAPI.deleteProject(id);
        await fetchProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Не удалось удалить проект. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const canModifyProject = (project: Project) => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    return project.customer === currentUser.id;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      'DRAFT': { variant: 'secondary', text: 'Черновик' },
      'PUBLISHED': { variant: 'primary', text: 'Опубликован' },
      'IN_PROGRESS': { variant: 'warning', text: 'В работе' },
      'COMPLETED': { variant: 'success', text: 'Завершен' },
      'CANCELLED': { variant: 'danger', text: 'Отменен' },
    };
    const statusInfo = statusMap[status] || { variant: 'light', text: status };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatBudget = (budget: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(parseFloat(budget));
  };

  if (loading) {
    return (
      <Container className="projects-list-container text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка проектов...</p>
      </Container>
    );
  }

  return (
    <Container className="projects-list-container">
      <div className="projects-list-header">
        <h1 className="projects-list-title">Проекты</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Создать проект
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {projects.length === 0 && !error ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📋</div>
            <h3>Нет проектов</h3>
            <p className="text-muted">Создайте свой первый проект, чтобы начать работу</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Создать проект
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive className="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Бюджет</th>
              <th>Срок</th>
              <th>Статус</th>
              <th>Заказчик</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const canModify = canModifyProject(project);
              
              return (
                <tr key={project.project_id}>
                  <td>
                    {project.project_id}
                  </td>
                  <td>{project.title}</td>
                  <td>{formatBudget(project.budget)}</td>
                  <td>{formatDate(project.deadline)}</td>
                  <td>{getStatusBadge(project.status)}</td>
                  <td>{project.customer_name || `ID: ${project.customer}`}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/projects/${project.project_id}`)}
                    >
                      Просмотр
                    </Button>
                    
                    {canModify && (
                      <>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowEditModal(true);
                          }}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProject(project.project_id)}
                        >
                          Удалить
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <CreateProjectModal
        currentUser={currentUser}
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />

      <EditProjectModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        onSubmit={handleUpdateProject}
        project={selectedProject}
      />
    </Container>
  );
};

export default ProjectsList;