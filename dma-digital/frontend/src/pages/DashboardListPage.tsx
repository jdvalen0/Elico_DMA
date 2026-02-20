import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Dashboard, Assessment } from '@mui/icons-material';
import { api } from '../services/api';

interface Evaluation {
  id: string;
  name: string;
  company: string;
  status: string;
  globalMaturity?: number;
  classification?: string;
}

export const DashboardListPage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔵 DashboardListPage - Component mounted');
    loadEvaluations();
  }, []);

  useEffect(() => {
    console.log('🔵 DashboardListPage - Loading:', loading);
    console.log('🔵 DashboardListPage - Evaluations:', evaluations);
    console.log('🔵 DashboardListPage - Error:', error);
  }, [loading, evaluations, error]);

  const loadEvaluations = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('🔵 DashboardListPage - Loading evaluations...');
      const response = await api.get('/evaluations');
      console.log('🔵 DashboardListPage - Response:', response);
      const evaluationsData = response.data?.data || response.data || [];
      console.log('🔵 DashboardListPage - Evaluations data:', evaluationsData);
      setEvaluations(evaluationsData);
    } catch (err: any) {
      console.error('🔴 DashboardListPage - Error loading evaluations:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al cargar evaluaciones';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboards</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {evaluations.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay evaluaciones disponibles
          </Typography>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => navigate('/evaluations/new')}
            sx={{ mt: 2 }}
          >
            Crear Primera Evaluación
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {evaluations.map((evaluation) => (
            <Grid item xs={12} sm={6} md={4} key={evaluation.id}>
              <Card
                sx={{ cursor: 'pointer', height: '100%' }}
                onClick={() => navigate(`/evaluations/${evaluation.id}/dashboard`)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Dashboard sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{evaluation.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {evaluation.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estado: {evaluation.status}
                  </Typography>
                  {evaluation.globalMaturity != null && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Madurez: {evaluation.globalMaturity.toFixed(2)} / 5.0
                    </Typography>
                  )}
                  {evaluation.classification && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      {evaluation.classification}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    startIcon={<Dashboard />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/evaluations/${evaluation.id}/dashboard`);
                    }}
                  >
                    Ver Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
