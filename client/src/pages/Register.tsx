import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import './Auth.css';
import { RegisterRequest, authAPI } from 'src/services/auth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'CUSTOMER',
    competencies: '',
    portfolio: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        role: formData.role,
      };

      if (formData.role === 'FREELANCER') {
        if (formData.competencies) {
          submitData.competencies = formData.competencies;
        }
        if (formData.portfolio) {
          submitData.portfolio = formData.portfolio;
        }
      }

      await authAPI.register(submitData);
      navigate('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const messages: string[] = [];
          Object.entries(errorData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              messages.push(`${key}: ${value.join(', ')}`);
            }
          });
          setError(messages.join(' | ') || 'Ошибка регистрации.');
        } else {
          setError('Ошибка регистрации.');
        }
      } else {
        setError('Ошибка регистрации.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center">
        <Col md={10} lg={8} xl={6} style={{width: '100%'}}>
          <Card className="auth-card shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
          
              <div className='auth-title'>
                {'Регистация'}
              </div>
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formUsername">
                      <Form.Label>Имя пользователя</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="auth-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="auth-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formFirstName">
                      <Form.Label>Имя</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        placeholder="Иван"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formLastName">
                      <Form.Label>Фамилия</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        placeholder="Иванов"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formRole">
                  <Form.Label>Роль</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="auth-input"
                  >
                    <option value="CUSTOMER">Заказчик</option>
                    <option value="FREELANCER">Исполнитель</option>
                  </Form.Select>
                </Form.Group>

                {formData.role === 'FREELANCER' && (
                  <>
                    <Form.Group className="mb-4" controlId="formCompetencies">
                      <Form.Label>Компетенции</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="competencies"
                        rows={3}
                        placeholder="Например: Python, React, Дизайн"
                        value={formData.competencies}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formPortfolio">
                      <Form.Label>Портфолио (URL)</Form.Label>
                      <Form.Control
                        type="url"
                        name="portfolio"
                        placeholder="https://ваше-портфолио.com"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </Form.Group>
                  </>
                )}

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 auth-btn mb-3" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Регистрация...
                    </>
                  ) : (
                    'Зарегистрироваться'
                  )}
                </Button>
              </Form>

              <div className="text-center auth-footer">
                <span className="text-muted">Уже есть аккаунт? </span>
                <Link to="/login" className="auth-link">Войти</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
