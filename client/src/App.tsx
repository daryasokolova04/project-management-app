import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/NavigationBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Stages from './pages/Stages';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import { authAPI } from './services/auth';

// Auth context for sharing auth state
export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  username: string | null;
  setIsAuthenticated: (value: boolean) => void;
  setUsername: (value: string | null) => void;
}>({
  isAuthenticated: false,
  username: null,
  setIsAuthenticated: () => {},
  setUsername: () => {},
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await authAPI.getProfile();
          setIsAuthenticated(true);
          setUsername(user.username);
        } catch (error) {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUsername(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          authAPI.getProfile().then(user => {
            setIsAuthenticated(true);
            setUsername(user.username);
          }).catch(() => {
            setIsAuthenticated(false);
            setUsername(null);
          });
        } else {
          setIsAuthenticated(false);
          setUsername(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUsername(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, setIsAuthenticated, setUsername }}>
      <Router>
        <div className="App">
          <NavigationBar
            isAuthenticated={isAuthenticated}
            username={username}
            onLogout={handleLogout}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments/project/:projectId"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stages"
              element={
                <ProtectedRoute>
                  <Stages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;