import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useUsers } from '../hooks/useUsers';
import { CreateProjectData } from 'src/services/project';

interface CreateProjectModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: CreateProjectData & { customer?: number }) => Promise<void>;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  show,
  onHide,
  onSubmit,
}) => {
  const { users, loading: usersLoading } = useUsers();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'DRAFT',
    customer: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        deadline: formData.deadline,
        status: formData.status as any,
        ...(formData.customer && { customer: parseInt(formData.customer) }),
      };
      
      await onSubmit(submitData);
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        status: 'DRAFT',
        customer: '',
      });
      onHide();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Создать новый проект</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название проекта *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Введите название проекта"
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
              placeholder="Введите описание проекта"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Бюджет *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              placeholder="Введите бюджет"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Срок выполнения *</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Заказчик (необязательно)</Form.Label>
            <Form.Select 
              name="customer" 
              value={formData.customer} 
              onChange={handleChange}
              disabled={usersLoading}
            >
              <option value="">Выберите заказчика (текущий пользователь по умолчанию)</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Если не выбран, заказчиком будет текущий пользователь
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Статус</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликован</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="COMPLETED">Завершен</option>
              <option value="CANCELLED">Отменен</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading || usersLoading}>
            {loading ? 'Сохранение...' : 'Создать проект'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;