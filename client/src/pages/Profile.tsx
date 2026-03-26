import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import './Profile.css';
import { User, authAPI } from 'src/services/auth';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await authAPI.getProfile();
        setUser(userData);
      } catch (err: unknown) {
        setError('Не удалось загрузить профиль. Пожалуйста, войдите снова.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'FREELANCER':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'FREELANCER':
        return 'Исполнитель';
      default:
        return 'Заказчик';
    }
  };

  if (loading) {
    return (
      <Container className="profile-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка профиля...</p>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || 'Пользователь не найден'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="profile-container">
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={6}>
          <Card className="profile-card shadow-lg border-0">
            <Card.Header className="profile-header">
              <div className="profile-avatar-large">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="profile-username">{user.username}</h3>
              <Badge bg={getRoleBadgeVariant(user.role)} className="profile-role-badge">
                {getRoleName(user.role)}
              </Badge>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="profile-section">
                <h5 className="profile-section-title">Основная информация</h5>
                <Card className="profile-info-card mb-3">
                  <Card.Body>
                    <Row className="profile-info-row">
                      <Col sm={4} className="profile-info-label">
                        <span className="info-icon">📧</span> Email:
                      </Col>
                      <Col sm={8} className="profile-info-value">{user.email}</Col>
                    </Row>
                    <hr className="profile-divider" />
                    <Row className="profile-info-row">
                      <Col sm={4} className="profile-info-label">
                        <span className="info-icon">👤</span> Имя:
                      </Col>
                      <Col sm={8} className="profile-info-value">{user.first_name || '—'}</Col>
                    </Row>
                    <hr className="profile-divider" />
                    <Row className="profile-info-row">
                      <Col sm={4} className="profile-info-label">
                        <span className="info-icon">📛</span> Фамилия:
                      </Col>
                      <Col sm={8} className="profile-info-value">{user.last_name || '—'}</Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>

              {user.role === 'FREELANCER' && (
                <div className="profile-section">
                  <h5 className="profile-section-title">
                    <span className="info-icon">💼</span> Информация исполнителя
                  </h5>
                  <Card className="profile-info-card mb-3">
                    <Card.Body>
                      <Row className="profile-info-row">
                        <Col sm={4} className="profile-info-label">
                          <span className="info-icon">🛠</span> Компетенции:
                        </Col>
                        <Col sm={8} className="profile-info-value">
                          {user.competencies || 'Не указаны'}
                        </Col>
                      </Row>
                      {user.portfolio && (
                        <>
                          <hr className="profile-divider" />
                          <Row className="profile-info-row">
                            <Col sm={4} className="profile-info-label">
                              <span className="info-icon">🔗</span> Портфолио:
                            </Col>
                            <Col sm={8} className="profile-info-value">
                              <a 
                                href={user.portfolio} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="profile-link"
                              >
                                {user.portfolio}
                                <span className="external-link-icon">↗</span>
                              </a>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )}

              <Button 
                variant="outline-danger" 
                onClick={handleLogout} 
                className="w-100 profile-logout-btn"
              >
                <span className="me-2">🚪</span> Выйти из аккаунта
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
