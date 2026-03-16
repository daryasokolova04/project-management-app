import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import CreateStageModal from '../components/CreateStageModal';
import PaymentModal from '../components/PaymentModal';
import './ProjectDetail.css';
import { authAPI } from 'src/services/auth';
import { Payment, paymentAPI } from 'src/services/payment';
import { Project, projectAPI } from 'src/services/project';
import { Stage, stageAPI, CreateStageData } from 'src/services/stage';
import { Team, teamAPI } from 'src/services/team';

interface User {
  id: number;
  username: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || '0');

  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateStageModal, setShowCreateStageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

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

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchAllProjects();
    }
  }, [projectId]);

  // Проверка, является ли проект текущего пользователя
  const isMyProject = useCallback(() => {
    return currentUser && project?.customer === currentUser.id;
  }, [currentUser, project]);

  const fetchAllProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectResponse = await projectAPI.getProject(projectId);
      setProject(projectResponse.data);
      
      await Promise.all([
        fetchStages(),
        fetchPayments(),
        fetchTeams(),
      ]);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Проект не найден');
      } else {
        setError('Не удалось загрузить информацию о проекте');
      }
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const stagesResponse = await stageAPI.getStages(projectId);
      setStages(stagesResponse.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStages([]); 
      } else {
        console.error('Error fetching stages:', err);
      }
    }
  };

  const fetchPayments = async () => {
    try {
      const paymentsResponse = await paymentAPI.getProjectPayments(projectId);
      setPayments(paymentsResponse.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPayments([]);
      } else {
        console.error('Error fetching payments:', err);
      }
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsResponse = await teamAPI.getTeams();
      const projectTeams = teamsResponse.data.filter(team => team.project === projectId);
      setTeams(projectTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const handleCreateStage = async (data: CreateStageData) => {
    try {
      await stageAPI.createStage(data);
      await fetchStages(); 
      setShowCreateStageModal(false);
    } catch (err) {
      console.error('Error creating stage:', err);
      throw err;
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    if (!isMyProject()) {
      alert('Вы можете удалять этапы только в своих проектах');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить этот этап?')) {
      try {
        await stageAPI.deleteStage(stageId);
        await fetchStages();
      } catch (err) {
        console.error('Error deleting stage:', err);
      }
    }
  };

  const handleCreatePayment = async (data: any) => {
    try {
      await paymentAPI.createPayment({ ...data, project: projectId });
      await fetchPayments();
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  const getStatusBadge = (status: string, type: 'project' | 'stage' | 'payment' = 'project') => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      // Project statuses
      'DRAFT': { variant: 'secondary', text: 'Черновик' },
      'PUBLISHED': { variant: 'primary', text: 'Опубликован' },
      'IN_PROGRESS': { variant: 'warning', text: 'В работе' },
      'COMPLETED': { variant: 'success', text: 'Завершен' },
      'CANCELLED': { variant: 'danger', text: 'Отменен' },
      // Stage statuses
      'PENDING': { variant: 'secondary', text: 'Ожидание' },
      'ON_HOLD': { variant: 'info', text: 'Приостановлен' },
      // Payment types
      'BUDGET': { variant: 'success', text: 'Бюджет' },
      'EXPENSE': { variant: 'danger', text: 'Расход' },
      'MILESTONE': { variant: 'info', text: 'Этап' },
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
      <Container className="project-detail-container text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка информации о проекте...</p>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container className="project-detail-container">
        <Alert variant="danger">
          {error || 'Проект не найден'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          Вернуться к списку проектов
        </Button>
      </Container>
    );
  }

  const myProject = isMyProject();

  return (
    <Container className="project-detail-container">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate('/projects')}
        className="mb-4"
      >
        ← Назад к проектам
      </Button>

      <Card className="project-detail-card">
        <Card.Header className="project-detail-header">
          <div>
            <h2 className="project-detail-title">
              {project.title}
              {myProject && (
                <Badge bg="info" className="ms-3">Мой проект</Badge>
              )}
            </h2>
            <p className="project-detail-customer mb-0">
              Заказчик: {project.customer_name || `ID: ${project.customer}`}
            </p>
          </div>
          <div className="project-detail-status">
            {getStatusBadge(project.status)}
          </div>
        </Card.Header>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'info')}
            className="mb-4"
          >
            <Tab eventKey="info" title="Информация">
              <Row className="mt-4">
                <Col md={6}>
                  <Card className="info-card">
                    <Card.Body>
                      <h5 className="info-card-title">Основная информация</h5>
                      <table className="info-table">
                        <tbody>
                          <tr>
                            <td>ID проекта:</td>
                            <td><strong>{project.project_id}</strong></td>
                          </tr>
                          <tr>
                            <td>Бюджет:</td>
                            <td><strong className="text-success">{formatBudget(project.budget)}</strong></td>
                          </tr>
                          <tr>
                            <td>Срок выполнения:</td>
                            <td><strong>{formatDate(project.deadline)}</strong></td>
                          </tr>
                          <tr>
                            <td>Дата создания:</td>
                            <td><strong>{formatDate(project.created_at)}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="info-card">
                    <Card.Body>
                      <h5 className="info-card-title">Описание</h5>
                      <p className="project-description">
                        {project.description || 'Описание отсутствует'}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="stages" title={`Этапы (${stages.length})`}>
              <div className="stages-tab-content">
                <div className="stages-header">
                  <h5 className="stages-title">Этапы проекта</h5>
                  {myProject && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowCreateStageModal(true)}
                    >
                      + Добавить этап
                    </Button>
                  )}
                </div>

                {stages.length === 0 ? (
                  <Card className="text-center p-4">
                    <Card.Body>
                      <div className="empty-stages-icon">📋</div>
                      <h6>Нет этапов</h6>
                      <p className="text-muted">
                        {myProject 
                          ? 'Добавьте первый этап проекта'
                          : 'В этом проекте пока нет этапов'}
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  <Table striped bordered hover responsive className="stages-table">
                    <thead>
                      <tr>
                        <th>Порядок</th>
                        <th>Название</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stages
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((stage) => (
                        <tr key={stage.project_stage_id}>
                          <td>{stage.order_index}</td>
                          <td>
                            <strong>{stage.name}</strong>
                            {stage.description && (
                              <div className="stage-description text-muted small">
                                {stage.description}
                              </div>
                            )}
                          </td>
                          <td>{getStatusBadge(stage.status, 'stage')}</td>
                          <td>
                            {myProject ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteStage(stage.project_stage_id)}
                              >
                                Удалить
                              </Button>
                            ) : (
                              <Badge bg="secondary" className="p-2">
                                Только просмотр
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>

            <Tab eventKey="payments" title={`Платежи (${payments.length})`}>
              <div className="payments-tab-content">
                <div className="payments-header">
                  <h5 className="payments-title">Платежи по проекту</h5>
                  {myProject && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      + Добавить платеж
                    </Button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <Card className="text-center p-4">
                    <Card.Body>
                      <div className="empty-payments-icon">💰</div>
                      <h6>Нет платежей</h6>
                      <p className="text-muted">
                        {myProject 
                          ? 'Добавьте первый платеж'
                          : 'В этом проекте пока нет платежей'}
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  <Table striped bordered hover responsive className="payments-table">
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Тип</th>
                        <th>Описание</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.payment_record_id}>
                          <td>{formatDate(payment.created_at)}</td>
                          <td>{getStatusBadge(payment.type, 'payment')}</td>
                          <td>{payment.description || '-'}</td>
                          <td className={parseFloat(payment.amount) >= 0 ? 'text-success' : 'text-danger'}>
                            {formatBudget(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>

            <Tab eventKey="teams" title={`Команды (${teams.length})`}>
              <div className="teams-tab-content">
                <h5 className="teams-title mb-3">Команды проекта</h5>
                {teams.length === 0 ? (
                  <Card className="text-center p-4">
                    <Card.Body>
                      <div className="empty-teams-icon">👥</div>
                      <h6>Нет команд</h6>
                      <p className="text-muted">Для проекта еще не созданы команды</p>
                    </Card.Body>
                  </Card>
                ) : (
                  teams.map((team) => (
                    <Card key={team.team_id} className="team-card mb-3">
                      <Card.Header>
                        <h6 className="mb-0">{team.name}</h6>
                      </Card.Header>
                      <Card.Body>
                        <p className="mb-2">Участников: {team.member_count}</p>
                        {team.members && team.members.length > 0 && (
                          <div className="team-members">
                            {team.members.map(member => (
                              <div key={member.team_member_id} className="member-item">
                                <span className="member-name">{member.user_username}</span>
                                <Badge bg="info" className="ms-2">{member.role_in_team}</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {myProject && (
        <>
          <CreateStageModal
            show={showCreateStageModal}
            onHide={() => setShowCreateStageModal(false)}
            onSubmit={handleCreateStage}
            initialProjectId={projectId}
            projects={projects}
          />

          <PaymentModal
            show={showPaymentModal}
            onHide={() => setShowPaymentModal(false)}
            onSubmit={handleCreatePayment}
            initialProjectId={projectId}
            projects={projects}
          />
        </>
      )}
    </Container>
  );
};

export default ProjectDetail;