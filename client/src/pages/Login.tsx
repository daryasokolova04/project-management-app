import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { authAPI } from '../services/api';
import axios from 'axios';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('authToken', response.token);
      // Dispatch storage event to notify App component
      window.dispatchEvent(new StorageEvent('storage', { key: 'authToken', newValue: response.token }));
      navigate('/profile');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Ошибка входа. Проверьте данные.');
      } else {
        setError('Ошибка входа. Проверьте данные.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5} style={{width: '100%'}}>
          <Card className="auth-card shadow-lg border-0">
            <Card.Body className="p-4 p-md-5" style={{width: '100%'}}>
              
              <div className='auth-title'>
                {'Авторизация'}
              </div>
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formEmail">
                  <Form.Label>Email адрес</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 auth-btn mb-3" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Вход...
                    </>
                  ) : (
                    'Войти'
                  )}
                </Button>
              </Form>

              <div className="text-center auth-footer">
                <span className="text-muted">Нет аккаунта? </span>
                <Link to="/register" className="auth-link">Зарегистрироваться</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
