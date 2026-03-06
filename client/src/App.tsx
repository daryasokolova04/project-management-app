import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import { authAPI } from './services/api';
import './App.css';

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

    // Listen for storage changes (login/logout in other tabs)
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
                  <Projects />
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
