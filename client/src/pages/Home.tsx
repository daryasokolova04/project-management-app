import React, { useContext } from 'react';
import { Container, Button } from 'react-bootstrap';
import './Home.css';
import { AuthContext } from 'src/App';

const Home: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Container className="home-container">
      <div className="home-content">
        <div className="home-logo-wrapper">

            <img
                    src="/logo.png"
                    alt="Логотип"
                    className="home-logo"
                  />
        </div>
        <h1 className="home-title">
          Система управления <span className="highlight">проектами</span>
        </h1>
        <p className="home-subtitle">
          Управляйте своими проектами, сотрудничайте с исполнителями 
          и отслеживайте прогресс в одном месте
        </p>
        <div className="home-features">
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span>Управление задачами</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span>Командная работа</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Отслеживание прогресса</span>
          </div>
        </div>
        {!isAuthenticated && (
          <div className="home-buttons">
            <Button 
              variant="primary" 
              size="lg" 
              href="/register"
              className="home-btn-primary"
            >
              Начать работу
            </Button>
            <Button 
              variant="outline-light" 
              size="lg" 
              href="/login"
              className="home-btn-secondary"
            >
              Войти
            </Button>
          </div>
        )}

        {isAuthenticated && (
          <div className="home-welcome">
            <h3>Добро пожаловать в систему!</h3>
            <p>Перейдите в раздел <a className='link' href="/projects">Проекты</a> чтобы начать работу</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Home;
