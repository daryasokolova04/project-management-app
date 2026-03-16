import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useUsers } from '../hooks/useUsers';
import { AddMemberData } from 'src/services/team';

interface AddMemberModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: AddMemberData) => Promise<void>;
  team: any;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  show,
  onHide,
  onSubmit,
  team,
}) => {
  const { users, loading: loadingUsers } = useUsers();
  const [formData, setFormData] = useState<AddMemberData>({
    user_id: 0,
    role_in_team: 'DEVELOPER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Фильтруем пользователей, которые уже в команде
  const availableUsers = users.filter(user => {
    if (!team?.members) return true;
    return !team.members.some((member: any) => member.user === user.id);
  });

  // Сбрасываем форму при открытии
  useEffect(() => {
    if (show) {
      setFormData({
        user_id: 0,
        role_in_team: 'DEVELOPER',
      });
      setError(null);
    }
  }, [show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_id' ? parseInt(value) || 0 : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      setError('Выберите пользователя');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      onHide();
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении участника');
    } finally {
      setLoading(false);
    }
  };

  // Получаем выбранного пользователя
  const selectedUser = users.find(u => u.id === formData.user_id);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Добавить участника в команду
          <br />
          <small className="text-muted">{team?.name}</small>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {loadingUsers ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
              <span>Загрузка пользователей...</span>
            </div>
          ) : availableUsers.length === 0 ? (
            <Alert variant="info">
              Все пользователи уже добавлены в эту команду
            </Alert>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Пользователь *</Form.Label>
                <Form.Select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Выберите пользователя</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email}) - {user.role}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Выберите пользователя из списка всех зарегистрированных пользователей
                </Form.Text>
              </Form.Group>

              {selectedUser && (
                <Alert variant="secondary" className="mb-3">
                  <small>
                    <strong>Выбранный пользователь:</strong> {selectedUser.username}
                    <br />
                    <strong>Email:</strong> {selectedUser.email}
                    <br />
                    <strong>Роль в системе:</strong> {selectedUser.role}
                  </small>
                </Alert>
              )}
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Роль в команде</Form.Label>
            <Form.Select
              name="role_in_team"
              value={formData.role_in_team}
              onChange={handleChange}
              disabled={loading || loadingUsers}
            >
              <option value="DEVELOPER">Developer</option>
              <option value="LEAD">Lead</option>
              <option value="TESTER">Tester</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || loadingUsers || availableUsers.length === 0}
          >
            {loading ? 'Добавление...' : 'Добавить участника'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddMemberModal;