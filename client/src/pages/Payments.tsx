import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert, Card, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import './Payments.css';
import { Payment, paymentAPI, CreatePaymentData } from 'src/services/payment';
import { Project, projectAPI } from 'src/services/project';

const Payments: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Если projectId есть в URL, используем его, иначе выбираем первый проект
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId || ''
  );

  // Загружаем проекты
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await projectAPI.getProjects();
        setProjects(response.data);
        
        // Если нет выбранного проекта и есть проекты, выбираем первый
        if (!selectedProjectId && response.data.length > 0) {
          setSelectedProjectId(response.data[0].project_id.toString());
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Не удалось загрузить список проектов');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Загружаем платежи для выбранного проекта
  const fetchPayments = async () => {
    if (!selectedProjectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await paymentAPI.getProjectPayments(parseInt(selectedProjectId));
      setPayments(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPayments([]);
      } else {
        setError('Не удалось загрузить платежи');
        console.error('Error fetching payments:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchPayments();
    }
  }, [selectedProjectId]);

  const handleCreatePayment = async (data: CreatePaymentData) => {
    try {
      await paymentAPI.createPayment(data);
      await fetchPayments();
      setShowModal(false);
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setSelectedProjectId(newProjectId);
    // Обновляем URL, если нужно
    if (projectId) {
      navigate(`/payments/project/${newProjectId}`);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: string; text: string }> = {
      'BUDGET': { variant: 'success', text: 'Бюджет' },
      'PAYMENT': { variant: 'danger', text: 'Расход' },
      'REFUND': { variant: 'info', text: 'Возврат' },
    };
    const typeInfo = typeMap[type] || { variant: 'light', text: type };
    return <Badge bg={typeInfo.variant}>{typeInfo.text}</Badge>;
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Получаем название выбранного проекта
  const selectedProject = projects.find(p => p.project_id === parseInt(selectedProjectId));

  if (loadingProjects) {
    return (
      <Container className="payments-container text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка проектов...</p>
      </Container>
    );
  }

  if (projects.length === 0) {
    return (
      <Container className="payments-container">
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📁</div>
            <h3>Нет проектов</h3>
            <p className="text-muted">Сначала создайте проект, чтобы управлять платежами</p>
            <Button variant="primary" href="/projects">
              Перейти к проектам
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="payments-container">
      <div className="payments-header">
        <h1 className="payments-title">
          Платежи
        </h1>
        <Button 
          variant="primary" 
          onClick={() => setShowModal(true)}
        >
          + Добавить платеж
        </Button>
      </div>

      {/* Выбор проекта (обязательный) */}
      <Card className="filters-card mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Проект</Form.Label>
            <Form.Select 
              value={selectedProjectId} 
              onChange={handleProjectChange}
            >
              {projects.map(project => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Просмотр платежей для выбранного проекта
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
      ) : payments.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">💰</div>
            <h3>Нет платежей</h3>
            <p className="text-muted">
              В проекте "{selectedProject?.title}" пока нет платежей
            </p>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="mt-2"
            >
              Добавить первый платеж
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Дата</th>
              <th>Тип</th>
              <th>Описание</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.payment_record_id}>
                <td>{payment.payment_record_id}</td>
                <td>{formatDate(payment.created_at)}</td>
                <td>{getTypeBadge(payment.type)}</td>
                <td>{payment.description || '-'}</td>
                <td className={parseFloat(payment.amount) >= 0 ? 'text-success' : 'text-danger'}>
                  {formatAmount(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Модалка создания платежа */}
      <PaymentModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleCreatePayment}
        projects={projects}
        initialProjectId={parseInt(selectedProjectId)}
      />
    </Container>
  );
};

export default Payments;