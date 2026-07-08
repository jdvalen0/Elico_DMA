import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setList } from '../store/slices/evaluationSlice';
import type { RootState } from '../store';

interface Evaluation {
  id: string;
  name: string;
  company: string;
  status: string;
  globalMaturity?: number;
  classification?: string;
}

export const HomePage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Verificar autenticación antes de cargar
    if (!isAuthenticated && !token) {
      console.warn('Usuario no autenticado, redirigiendo a login...');
      navigate('/login');
      return;
    }
    loadEvaluations();
  }, [isAuthenticated, token, navigate]);

  const loadEvaluations = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('Cargando evaluaciones...', {
        isAuthenticated,
        hasToken: !!token,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      });
      
      const response = await api.get('/evaluations');
      console.log('Evaluations response:', response.data);
      
      const evaluationsData = response.data.data || [];
      setEvaluations(evaluationsData);
      dispatch(setList(evaluationsData));
      
      if (evaluationsData.length === 0) {
        console.info('No hay evaluaciones en la respuesta');
      }
    } catch (error: any) {
      console.error('Error loading evaluations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      
      // Si es 401, el interceptor ya redirige a login
      if (error.response?.status === 401) {
        setError('Sesión expirada. Redirigiendo a login...');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setError('No tienes permisos para ver evaluaciones');
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        setError('Error de conexión. Verifica que el backend esté corriendo en http://localhost:3001');
      } else {
        setError(`Error al cargar evaluaciones: ${error.response?.data?.error?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluation = () => {
    navigate('/evaluations/new');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Evaluaciones</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateEvaluation}
        >
          Nueva Evaluación
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {evaluations.map((evaluation) => (
          <Grid item xs={12} sm={6} md={6} key={evaluation.id}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => navigate(`/evaluations/${evaluation.id}`)}
            >
              <CardContent sx={{ p: 3, flex: 1, '&:last-child': { pb: 3 } }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3 }}>
                    {evaluation.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {evaluation.company}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Estado: {evaluation.status}
                </Typography>
                {evaluation.globalMaturity != null && (
                  <Typography variant="body2" sx={{ mt: 1.5 }}>
                    Madurez: {evaluation.globalMaturity.toFixed(2)} / 5.0
                  </Typography>
                )}
                {evaluation.classification && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {evaluation.classification}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {evaluations.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay evaluaciones
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateEvaluation}
            sx={{ mt: 2 }}
          >
            Crear Primera Evaluación
          </Button>
        </Box>
      )}
    </Box>
  );
};
