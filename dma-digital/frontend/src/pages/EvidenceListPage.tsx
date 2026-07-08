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
import { PhotoLibrary, Assessment } from '@mui/icons-material';
import { api } from '../services/api';

interface Evaluation {
  id: string;
  name: string;
  company: string;
  status: string;
  globalMaturity?: number;
  classification?: string;
}

export const EvidenceListPage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('EvidenceListPage - Component mounted');
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.get('/evaluations');
      const evaluationsData = response.data.data || [];
      setEvaluations(evaluationsData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar evaluaciones');
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
        <Typography variant="h4">Evidencias</Typography>
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
                onClick={() => navigate(`/evaluations/${evaluation.id}/evidence`)}
              >
                <CardContent sx={{ p: 3, flex: 1, '&:last-child': { pb: 3 } }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PhotoLibrary sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
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
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                    startIcon={<PhotoLibrary />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/evaluations/${evaluation.id}/evidence`);
                    }}
                  >
                    Ver Evidencias
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
