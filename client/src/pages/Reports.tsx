import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { reportAPI, UserProjectReport } from 'src/services/report';
import './Reports.css';

const Reports: React.FC = () => {
  const [projects, setProjects] = useState<UserProjectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
  });

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportAPI.getUserProjects(
        filters.date_from || undefined,
        filters.date_to || undefined,
        filters.status || undefined
      );
      setProjects(response.data);
    } catch (err) {
      setError('Не удалось загрузить отчеты');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchReports();
  };

  const handleResetFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      status: '',
    });
    setTimeout(() => fetchReports(), 0);
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

  const formatBudget = (budget: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(parseFloat(budget));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <Container className="reports-container text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка отчетов...</p>
      </Container>
    );
  }

  return (
    <Container className="reports-container">
      <h1 className="reports-title">Отчеты по проектам</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="filters-card mb-4">
        <Card.Body>
          <h5 className="filters-title">Фильтры</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Дата с</Form.Label>
                <Form.Control
                  type="date"
                  name="date_from"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Дата по</Form.Label>
                <Form.Control
                  type="date"
                  name="date_to"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Статус</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Все</option>
                  <option value="DRAFT">Черновик</option>
                  <option value="PUBLISHED">Опубликован</option>
                  <option value="IN_PROGRESS">В работе</option>
                  <option value="COMPLETED">Завершен</option>
                  <option value="CANCELLED">Отменен</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <div className="mb-3 d-flex gap-2">
                <Button variant="primary" onClick={handleApplyFilters}>
                  Применить
                </Button>
                <Button variant="outline-secondary" onClick={handleResetFilters}>
                  Сбросить
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {projects.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <div className="empty-state-icon">📊</div>
            <h3>Нет данных</h3>
            <p className="text-muted">Нет проектов, соответствующих выбранным фильтрам</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {projects.map((project) => (
            <Col md={6} lg={4} key={project.project_id} className="mb-4">
              <Card className="project-report-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="project-report-title">{project.title}</h5>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  <div className="project-report-details mb-3">
                    <div className="detail-item">
                      <span className="detail-label">Бюджет:</span>
                      <span className="detail-value text-success">{formatBudget(project.budget)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Срок:</span>
                      <span className="detail-value">{formatDate(project.deadline)}</span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Прогресс этапов:</span>
                      <strong>{project.completed_stages}/{project.total_stages}</strong>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${calculateProgress(project.completed_stages, project.total_stages)}%` }}
                        aria-valuenow={calculateProgress(project.completed_stages, project.total_stages)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {calculateProgress(project.completed_stages, project.total_stages)}%
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Reports;