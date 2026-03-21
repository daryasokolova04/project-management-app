import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Project } from 'src/services/project';
import { CreateStageData } from 'src/services/stage';

interface CreateStageModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: CreateStageData) => Promise<void>;
  initialProjectId?: number;
  projects: Project[];
  currentUser?: any;
}

const CreateStageModal: React.FC<CreateStageModalProps> = ({
  show,
  onHide,
  onSubmit,
  initialProjectId,
  projects,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order_index: 0,
    status: 'PENDING',
    project: initialProjectId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setFormData({
        name: '',
        description: '',
        order_index: 0,
        status: 'PENDING',
        project: initialProjectId || '',
      });
      setError(null);
    }
  }, [show, initialProjectId]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'order_index' ? parseInt(value) || 0 : value 
    }));
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project) {
      setError('Выберите проект');
      return;
    }
    if (!formData.name.trim()) {
      setError('Введите название этапа');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const submitData: CreateStageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order_index: formData.order_index,
        status: formData.status as any,
        project: parseInt(formData.project.toString()),
      };
      
      await onSubmit(submitData);
      onHide();
    } catch (error: any) {
      setError(error.message || 'Ошибка при создании этапа');
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = useMemo(() => {
    return projects.map(project => (
      <option key={project.project_id} value={project.project_id}>
        {project.title}
      </option>
    ));
  }, [projects]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Создать новый этап</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Проект *</Form.Label>
            <Form.Select
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              disabled={loading || projects.length === 0}
            >
              <option value="">Выберите проект</option>
              {projectOptions}
            </Form.Select>
            {projects.length === 0 && (
              <Form.Text className="text-danger">
                У вас нет проектов для создания этапов
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Название этапа *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите название этапа"
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
              placeholder="Введите описание этапа"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Порядковый номер</Form.Label>
            <Form.Control
              type="number"
              name="order_index"
              value={formData.order_index}
              onChange={handleChange}
              min="0"
              disabled={loading}
              placeholder="0"
            />
            <Form.Text className="text-muted">
              Определяет порядок этапов (меньше число = первый этап)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Статус</Form.Label>
            <Form.Select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              disabled={loading}
            >
              <option value="PENDING">Ожидание</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="DONE">Завершен</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading || projects.length === 0}>
            {loading ? 'Сохранение...' : 'Создать этап'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default React.memo(CreateStageModal);