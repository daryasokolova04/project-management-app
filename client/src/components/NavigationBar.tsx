import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import './NavigationBar.css';

interface NavigationBarProps {
  isAuthenticated: boolean;
  username: string | null;
  onLogout: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  isAuthenticated,
  username,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" variant="light" expand="lg" className="navbar-custom shadow-sm">
      <Container fluid className="navbar-container">
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src="/logo.png"
            alt="Логотип"
            className="navbar-logo"
          />
          <span className="navbar-brand-text">Управление проектами</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/" className="nav-link-custom">
                  Главная
                </Nav.Link>
                <Nav.Link as={Link} to="/projects" className="nav-link-custom">
                  Проекты
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">
                  Войти
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn btn-primary btn-nav">
                  Регистрация
                </Nav.Link>
              </>
            ) : (
              <NavDropdown 
                title={
                  <span className="user-dropdown">
                    <span className="user-avatar">
                      {username?.charAt(0).toUpperCase()}
                    </span>
                    <span className="user-name">{username}</span>
                    <span className="dropdown-arrow">▼</span>
                  </span>
                } 
                id="basic-nav-dropdown" 
                align="end"
                className="user-dropdown-menu"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Профиль
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="logout-item">
                  Выйти
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
