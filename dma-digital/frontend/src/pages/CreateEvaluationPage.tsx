import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { api } from '../services/api';
import { useDispatch } from 'react-redux';
import { setCurrent } from '../store/slices/evaluationSlice';

const SECTORS = [
  { value: 'manufacturing', label: 'Manufactura' },
  { value: 'pharmaceutical', label: 'Farmacéutico' },
  { value: 'food', label: 'Alimentos y Bebidas' },
  { value: 'chemical', label: 'Químico' },
  { value: 'textile', label: 'Textil' },
  { value: 'metallurgical', label: 'Metalúrgico' },
  { value: 'other', label: 'Otro' },
];

export const CreateEvaluationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    sector: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/evaluations', formData);
      dispatch(setCurrent(response.data));
      navigate(`/evaluations/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear evaluación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="800px" mx="auto">
      <Typography variant="h4" gutterBottom>
        Nueva Evaluación de Madurez Digital
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nombre de la Evaluación"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="Ej: Evaluación Empresa ABC - 2026"
            />

            <TextField
              fullWidth
              label="Empresa"
              name="company"
              value={formData.company}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              select
              label="Sector Industrial"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              margin="normal"
              required
            >
              {SECTORS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Fecha de Inicio"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Evaluación'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Al crear la evaluación, el sistema inicializará
          automáticamente las 12 dimensiones del modelo ELICO 4.0 con sus
          respectivos subcriterios. Podrás comenzar a responder las preguntas
          inmediatamente.
        </Typography>
      </Box>
    </Box>
  );
};
