import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert, Badge, Button, Card, Container, Form, Spinner, Table } from 'react-bootstrap';
import CreateStageModal from '../components/CreateStageModal';
import './Stages.css';
import { authAPI } from 'src/services/auth';
import { Project, projectAPI } from 'src/services/project';
import { Stage, stageAPI, CreateStageData } from 'src/services/stage';

interface User {
  id: number;
  username: string;
  role?: string;
}

const Stages: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

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

  // Загружаем ТОЛЬКО СВОИ проекты
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await projectAPI.getProjects();
        // Фильтруем только проекты текущего пользователя
        const myProjects = response.data.filter(p => p.customer === currentUser?.id);
        setProjects(myProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Не удалось загрузить список проектов');
      } finally {
        setLoadingProjects(false);
      }
    };
    
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  // Загружаем этапы для выбранного проекта
  useEffect(() => {
    const fetchStages = async () => {
      if (!selectedProjectId) {
        setStages([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await stageAPI.getStages(parseInt(selectedProjectId));
        setStages(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setStages([]);
        } else {
          setError('Не удалось загрузить этапы');
          console.error('Error fetching stages:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, [selectedProjectId]);

  const handleCreateStage = async (data: CreateStageData) => {
    try {
      await stageAPI.createStage(data);
      if (selectedProjectId) {
        const response = await stageAPI.getStages(parseInt(selectedProjectId));
        setStages(response.data);
      }
      setShowModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateStage = useCallback(async (id: number, data: Partial<CreateStageData>) => {
    try {
      await stageAPI.updateStage(id, data);
      if (selectedProjectId) {
        const response = await stageAPI.getStages(parseInt(selectedProjectId));
        setStages(response.data);
      }
      setSelectedStage(null);
    } catch (err) {
      console.error('Error updating stage:', err);
      setError('Не удалось обновить этап');
    }
  }, [selectedProjectId]);

  const handleDeleteStage = useCallback(async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот этап?')) {
      try {
        await stageAPI.deleteStage(id);
        if (selectedProjectId) {
          const response = await stageAPI.getStages(parseInt(selectedProjectId));
          setStages(response.data);
        }
      } catch (err) {
        console.error('Error deleting stage:', err);
        setError('Не удалось удалить этап');
      }
    }
  }, [selectedProjectId]);

  const getStatusBadge = useCallback((status: string) => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      'PENDING': { variant: 'secondary', text: 'Ожидание' },
      'IN_PROGRESS': { variant: 'warning', text: 'В работе' },
      'DONE': { variant: 'success', text: 'Завершен' },
    };
    const statusInfo = statusMap[status] || { variant: 'light', text: status };
    return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
  }, []);

  const projectOptions = useMemo(() => {
    return projects.map(project => (
      <option key={project.project_id} value={project.project_id}>
        {project.title}
      </option>
    ));
  }, [projects]);

  if (loadingProjects) {
    return (
      <Container className="stages-container text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка ваших проектов...</p>
      </Container>
    );
  }

  if (projects.length === 0 && currentUser) {
    return (
      <Container className="stages-container">
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📋</div>
            <h3>У вас нет проектов</h3>
            <p className="text-muted">
              Сначала создайте проект, чтобы управлять этапами
            </p>
            <Button variant="primary" href="/projects">
              Перейти к проектам
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="stages-container">
      <div className="stages-header">
        <h1 className="stages-title">
          Управление этапами
        </h1>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
          disabled={projects.length === 0}
        >
          + Создать этап
        </Button>
      </div>

      <Card className="filters-card mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Выберите ваш проект</Form.Label>
            <Form.Select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">Все проекты</option>
              {projectOptions}
            </Form.Select>
            <Form.Text className="text-muted">
              Вы можете управлять этапами только в своих проектах
            </Form.Text>
          </Form.Group>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : !selectedProjectId ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📋</div>
            <h3>Выберите проект</h3>
            <p className="text-muted">Выберите проект для просмотра этапов</p>
          </Card.Body>
        </Card>
      ) : stages.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📋</div>
            <h3>Нет этапов</h3>
            <p className="text-muted">Создайте первый этап для этого проекта</p>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="mt-2"
            >
              Создать этап
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive className="stages-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Порядок</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => {
              console.log('stage', stage)
              return (
                <tr key={stage.project_stage_id}>
                  <td>{stage.project_stage_id}</td>
                  <td>
                    {selectedStage?.project_stage_id === stage.project_stage_id ? (
                      <Form.Control
                        type="text"
                        value={selectedStage.name}
                        onChange={(e) => setSelectedStage({ ...selectedStage, name: e.target.value })}
                        size="sm"
                      />
                    ) : (
                      stage.name
                    )}
                  </td>
                  <td>{stage.description || '-'}</td>
                  <td>{stage.order_index}</td>
                  <td>
                    {selectedStage?.project_stage_id === stage.project_stage_id ? (
                      <Form.Select
                        value={selectedStage.status}
                        onChange={(e) => setSelectedStage({ ...selectedStage, status: e.target.value as any })}
                        size="sm"
                      >
                        <option value="PENDING">Ожидание</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="DONE">Завершен</option>
                      </Form.Select>
                    ) : (
                      getStatusBadge(stage.status)
                    )}
                  </td>
                  <td>
                    {selectedStage?.project_stage_id === stage.project_stage_id ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleUpdateStage(stage.project_stage_id, {
                            name: selectedStage.name,
                            status: selectedStage.status,
                            project: selectedStage.project,
                            order_index: selectedStage.order_index
                          })}
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedStage(null)}
                        >
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => setSelectedStage(stage)}
                        >
                          Изменить
                        </Button>
              {    currentUser?.role === 'ADMIN'  &&   <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteStage(stage.project)}
                        >
                          Удалить
                        </Button>}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <CreateStageModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleCreateStage}
        initialProjectId={selectedProjectId ? parseInt(selectedProjectId) : undefined}
        projects={projects}
        currentUser={currentUser}
      />
    </Container>
  );
};

export default Stages;