import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useUsers } from 'src/hooks/useUsers';

interface TaskModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => Promise<void>;
  stageId: number;
  task?: any | null;
  users: Array<{ id: number; username: string; email: string }>;
}

const TaskModal: React.FC<TaskModalProps> = ({
  show,
  onHide,
  onSubmit,
  stageId,
  task,
  users,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    assignee: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        assignee: task.assignee?.toString() || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'OPEN',
        assignee: '',
      });
    }
    setError(null);
  }, [task, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Введите название задачи');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      // Добавляем assignee только если выбран
      if (formData.assignee) {
        Object.assign(submitData, { assignee: parseInt(formData.assignee) });
      }
      
      await onSubmit(submitData);
      onHide();
    } catch (error: any) {
      setError(error.message || 'Ошибка при сохранении задачи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {task ? 'Редактировать задачу' : 'Создать задачу'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Название задачи *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите название задачи"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Введите описание задачи"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Статус</Form.Label>
            <Form.Select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              disabled={loading}
            >
              <option value="OPEN">Открыта</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Завершена</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Исполнитель</Form.Label>
            <Form.Select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Не назначен</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Выберите исполнителя из списка
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : task ? 'Сохранить' : 'Создать'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskModal;