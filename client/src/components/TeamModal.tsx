import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface TeamModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => Promise<void>;
  team?: any | null;
  projects: any[];
  currentUser?: any;
}

const TeamModal: React.FC<TeamModalProps> = ({
  show,
  onHide,
  onSubmit,
  team,
  projects,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    project: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        project: team.project?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        project: '',
      });
    }
    setError(null);
  }, [team, show]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Введите название команды');
      return;
    }
    
    if (!formData.project) {
      setError('Выберите проект');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const submitData = {
        name: formData.name.trim(),
        project: parseInt(formData.project),
      };
      
      await onSubmit(submitData);
      onHide();
    } catch (error: any) {
      setError(error.message || 'Ошибка при сохранении команды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {team ? 'Редактировать команду' : 'Создать новую команду'}
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
            <Form.Label>Название команды *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Введите название команды"
            />
          </Form.Group>

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
              {projects.map(project => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </Form.Select>
            {projects.length === 0 && (
              <Form.Text className="text-danger">
                Сначала создайте проект
              </Form.Text>
            )}
          </Form.Group>

          {team && (
            <Form.Group className="mb-3">
              <Form.Label>Текущий проект</Form.Label>
              <Form.Control
                type="text"
                value={projects.find(p => p.project_id === team.project)?.title || 'Неизвестный проект'}
                disabled
                readOnly
              />
              <Form.Text className="text-muted">
                Изменение проекта может повлиять на доступ участников
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || projects.length === 0}
          >
            {loading ? 'Сохранение...' : team ? 'Сохранить изменения' : 'Создать команду'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TeamModal;