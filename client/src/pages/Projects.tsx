import React from 'react';
import { Container, Card } from 'react-bootstrap';
import './Projects.css';

const Projects: React.FC = () => {
  return (
    <Container className="projects-container">
      <div className="projects-content">
        <div className="projects-icon">🚧</div>
        <h1 className="projects-title">Страница проектов</h1>
        <p className="projects-subtitle">
          В разработке... Скоро здесь появится возможность управления проектами
        </p>
        <Card className="projects-card shadow-sm border-0">
          <Card.Body>
            <h5 className="projects-card-title">Что будет доступно:</h5>
            <ul className="projects-list">
              <li>📋 Создание и редактирование проектов</li>
              <li>👥 Назначение исполнителей</li>
              <li>📊 Отслеживание прогресса</li>
              <li>💬 Обсуждение задач</li>
              <li>📁 Управление файлами</li>
            </ul>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Projects;
