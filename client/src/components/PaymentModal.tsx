import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface PaymentModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => Promise<void>;
  projects: Array<{ project_id: number; title: string }>;
  initialProjectId?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  onHide,
  onSubmit,
  projects,
  initialProjectId,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'BUDGET',
    project: initialProjectId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Сбрасываем форму при открытии
  useEffect(() => {
    if (show) {
      setFormData({
        amount: '',
        description: '',
        type: 'BUDGET',
        project: initialProjectId || '',
      });
      setError(null);
    }
  }, [show, initialProjectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project) {
      setError('Выберите проект');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const submitData = {
        amount: formData.amount,
        description: formData.description,
        type: formData.type,
        project: parseInt(formData.project.toString()),
      };
      
      console.log('Submitting payment:', submitData);
      await onSubmit(submitData);
      onHide();
    } catch (error: any) {
      console.error('Error in payment modal:', error);
      setError(error.message || 'Ошибка при создании платежа');
    } finally {
      setLoading(false);
    }
  };

  // Название выбранного проекта
  const selectedProject = projects.find(p => p.project_id === parseInt(formData.project.toString()));

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Добавить платеж</Modal.Title>
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
              disabled={loading}
            >
              <option value="">Выберите проект</option>
              {projects.map(project => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </Form.Select>
            {selectedProject && (
              <Form.Text className="text-success">
                Платеж будет добавлен для проекта: {selectedProject.title}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Сумма *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Введите сумму"
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Тип платежа</Form.Label>
            <Form.Select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              disabled={loading}
            >
              <option value="BUDGET">Бюджет</option>
              <option value="PAYMENT">Расход</option>
              <option value="REFUND">Возврат</option>
            </Form.Select>
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
              placeholder="Введите описание платежа"
            />
          </Form.Group>

          {/* Предпросмотр */}
          {formData.project && formData.amount && (
            <Alert variant="secondary" className="mt-3">
              <small>
                <strong>Итог:</strong><br />
                Проект: {selectedProject?.title}<br />
                Сумма: {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                }).format(parseFloat(formData.amount))}<br />
                Тип: {formData.type === 'BUDGET' ? 'Бюджет' : 
                       formData.type === 'EXPENSE' ? 'Расход' :
                       formData.type === 'MILESTONE' ? 'Этап' : 'Другое'}
              </small>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Добавить платеж'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PaymentModal;