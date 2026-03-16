import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useUsers } from '../hooks/useUsers';
import { CreateProjectData, Project } from 'src/services/project';

interface EditProjectModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (id: number, data: Partial<CreateProjectData & { customer?: number }>) => Promise<void>;
  project: Project | null;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  show,
  onHide,
  onSubmit,
  project,
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

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        budget: project.budget,
        deadline: project.deadline,
        status: project.status,
        customer: project.customer?.toString() || '',
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setLoading(true);
    try {
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        deadline: formData.deadline,
        status: formData.status,
      };
      
      if (formData.customer) {
        submitData.customer = parseInt(formData.customer);
      }
      
      await onSubmit(project.project_id, submitData);
      onHide();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Редактировать проект</Modal.Title>
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
            <Form.Label>Заказчик</Form.Label>
            <Form.Select 
              name="customer" 
              value={formData.customer} 
              onChange={handleChange}
              disabled={usersLoading}
            >
              <option value="">Не изменять</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </Form.Select>
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
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProjectModal;