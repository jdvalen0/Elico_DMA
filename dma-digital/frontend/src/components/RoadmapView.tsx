import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Button,
} from '@mui/material';
import { ExpandMore, TrendingUp, Schedule, AttachMoney, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../services/api';
import { RootState } from '../store';

interface RoadmapViewProps {
  evaluationId: string;
}

export const RoadmapView = ({ evaluationId }: RoadmapViewProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const canEditConfig = user?.role === 'ADMIN' || user?.role === 'CONSULTANT';

  const loadRoadmap = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/roadmap/evaluations/${evaluationId}/roadmap`);
      setRoadmap(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Roadmap no generado. Genera uno desde el dashboard.');
      } else {
        setError(err.response?.data?.error?.message || 'Error al cargar roadmap');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post(`/roadmap/evaluations/${evaluationId}/roadmap/generate`);
      setRoadmap(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al generar roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [evaluationId]);

  if (loading && !roadmap) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !roadmap) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box textAlign="center">
          <Typography variant="body1" gutterBottom>
            No se ha generado un roadmap para esta evaluación.
          </Typography>
          <button onClick={generateRoadmap} style={{ marginTop: '1rem' }}>
            Generar Roadmap
          </button>
        </Box>
      </Box>
    );
  }

  if (!roadmap) {
    return null;
  }

  const phases = roadmap.phases || [];
  const currency = roadmap.currency || phases[0]?.currency || 'USD';
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Verificar si hay mejoras en alguna fase
  const hasImprovements = phases.some((phase: any) => phase.improvements?.length > 0);

  if (!hasImprovements) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Roadmap generado pero sin mejoras identificadas</strong>
          </Typography>
          <Typography variant="body2">
            Esto puede ocurrir si:
          </Typography>
          <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <li>La madurez de todas las dimensiones ya está en el nivel objetivo</li>
            <li>No se han calculado las madureces de las dimensiones</li>
            <li>La configuración económica necesita ajustes</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Solución:</strong> Asegúrate de haber calculado la madurez primero (botón "Calcular Madurez").
            Incluso con madurez 0, el roadmap debería mostrar mejoras para todas las dimensiones.
          </Typography>
        </Alert>
        <Box textAlign="center" mt={2}>
          <Button
            variant="contained"
            onClick={generateRoadmap}
            disabled={loading}
          >
            {loading ? 'Regenerando...' : 'Regenerar Roadmap'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Roadmap de Transformación Digital</Typography>
        <Box display="flex" gap={1} alignItems="center">
          {roadmap.totalROI && (
            <Chip
              icon={<TrendingUp />}
              label={`ROI: ${(roadmap.totalROI * 100).toFixed(0)}%`}
              color="success"
              sx={{ mr: 1 }}
            />
          )}
          {roadmap.totalInvestment && (
            <Chip
              icon={<AttachMoney />}
              label={`Inversión: ${formatCurrency(roadmap.totalInvestment)}`}
            />
          )}
          {canEditConfig && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Settings />}
              onClick={() => navigate(`/evaluations/${evaluationId}/economic-config`)}
              sx={{ ml: 1 }}
            >
              Config
            </Button>
          )}
        </Box>
      </Box>

      {phases.map((phase: any, index: number) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" width="100%">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {phase.phase}
              </Typography>
              <Chip
                icon={<Schedule />}
                label={phase.duration}
                size="small"
                sx={{ mr: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {phase.improvements?.length || 0} mejoras
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {phase.improvements?.length === 0 ? (
              <Alert severity="info">
                No hay mejoras en esta fase. Ajusta la configuración económica o genera un nuevo roadmap.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {phase.improvements?.map((improvement: any, impIndex: number) => (
                <Grid item xs={12} md={6} key={impIndex}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {improvement.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {improvement.description}
                      </Typography>

                      <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                        {improvement.roi?.estimated && (
                          <Chip
                            label={`ROI: ${(improvement.roi.estimated * 100).toFixed(0)}%`}
                            color="success"
                            size="small"
                          />
                        )}
                        {improvement.effort?.months && (
                          <Chip
                            label={`${improvement.effort.months} meses`}
                            size="small"
                          />
                        )}
                        {improvement.effort?.cost && (
                          <Chip
                            label={formatCurrency(improvement.effort.cost)}
                            size="small"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {roadmap.totalAnnualValue && (
        <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Valor Anual Estimado
            </Typography>
            <Typography variant="h4" color="success.dark">
              {formatCurrency(roadmap.totalAnnualValue)}/año
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
