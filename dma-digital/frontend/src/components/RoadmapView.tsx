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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
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
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [companySize, setCompanySize] = useState<'small' | 'medium' | 'large'>('medium');
  const [budget, setBudget] = useState<string>('');

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
      const parsedBudget = budget.trim() ? Number(budget) : undefined;
      const response = await api.post(`/roadmap/evaluations/${evaluationId}/roadmap/generate`, {
        companySize,
        budget: parsedBudget && parsedBudget > 0 ? parsedBudget : undefined,
      });
      setRoadmap(response.data);
      setConfigDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al generar roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [evaluationId]);

  const renderConfigDialog = () => (
    <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Parámetros del Roadmap</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          El presupuesto y las estimaciones económicas <strong>no forman parte de la evaluación</strong>:
          dependen del contexto de cada empresa. Ingresa los parámetros de este caso.
        </Typography>
        <TextField
          select
          fullWidth
          label="Tamaño de la empresa"
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value as any)}
          sx={{ mb: 2, mt: 1 }}
          helperText="Escala las estimaciones de costo y esfuerzo de cada proyecto"
        >
          <MenuItem value="small">Pequeña (&lt;50 empleados) — costos ×0.5</MenuItem>
          <MenuItem value="medium">Mediana (50-250 empleados) — costos ×1.0</MenuItem>
          <MenuItem value="large">Grande (&gt;250 empleados o multi-sitio) — costos ×1.8</MenuItem>
        </TextField>
        <TextField
          fullWidth
          type="number"
          label="Presupuesto disponible (opcional)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          inputProps={{ min: 0 }}
          helperText="Si se define, el roadmap solo incluirá mejoras que quepan en el presupuesto, priorizando mayor ROI por esfuerzo"
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          Las estimaciones de costo, esfuerzo y ROI son referenciales y deben validarse con cotizaciones reales.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
        <Button variant="contained" onClick={generateRoadmap} disabled={loading}>
          {loading ? 'Generando...' : 'Generar Roadmap'}
        </Button>
      </DialogActions>
    </Dialog>
  );

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
          <Button
            variant="contained"
            onClick={() => setConfigDialogOpen(true)}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Generar Roadmap
          </Button>
        </Box>
        {renderConfigDialog()}
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
            onClick={() => setConfigDialogOpen(true)}
            disabled={loading}
          >
            {loading ? 'Regenerando...' : 'Regenerar Roadmap'}
          </Button>
        </Box>
        {renderConfigDialog()}
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
          <Button
            variant="outlined"
            size="small"
            onClick={() => setConfigDialogOpen(true)}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            Regenerar
          </Button>
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

      <Alert severity="warning" sx={{ mb: 2 }}>
        {roadmap.estimatesDisclaimer ||
          roadmap.parameters?.disclaimer ||
          'Las estimaciones de costo, esfuerzo y ROI son referenciales y deben validarse con cotizaciones reales por proyecto.'}
        {roadmap.parameters && (
          <>
            {' '}
            Parámetros usados: tamaño <strong>{roadmap.parameters.companySizeLabel}</strong>
            {roadmap.parameters.budget
              ? `, presupuesto ${formatCurrency(roadmap.parameters.budget)}`
              : ', sin límite de presupuesto'}
            .
          </>
        )}
        {roadmap.excludedByBudget > 0 &&
          ` ${roadmap.excludedByBudget} mejora(s) quedaron fuera por restricción de presupuesto.`}
      </Alert>

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

                      {Array.isArray(improvement.actions) && improvement.actions.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Acciones recomendadas
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {improvement.actions.map((action: string, actionIdx: number) => (
                              <Typography key={actionIdx} component="li" variant="body2">
                                {action}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                        {improvement.roi?.estimated != null && (
                          <Chip
                            label={`ROI: ${(improvement.roi.estimated * 100).toFixed(0)}%`}
                            color={improvement.roi.estimated > 0 ? 'success' : 'default'}
                            size="small"
                          />
                        )}
                        {improvement.effort?.months && (
                          <Chip
                            label={`${improvement.effort.months} meses`}
                            size="small"
                          />
                        )}
                        {improvement.effort?.cost != null && (
                          <Chip
                            label={formatCurrency(improvement.effort.cost)}
                            size="small"
                          />
                        )}
                        {improvement.roi?.paybackMonths != null &&
                          Number.isFinite(improvement.roi.paybackMonths) && (
                            <Chip
                              label={`Payback: ${improvement.roi.paybackMonths.toFixed(0)} meses`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                      </Box>

                      {Array.isArray(improvement.effort?.resources) &&
                        improvement.effort.resources.length > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 1 }}
                          >
                            Recursos: {improvement.effort.resources.join(', ')}
                          </Typography>
                        )}
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

      {renderConfigDialog()}
    </Box>
  );
};
