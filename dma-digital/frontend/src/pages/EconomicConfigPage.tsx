import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import { api } from '../services/api';
import { RootState } from '../store';

interface EconomicConfig {
  id?: string;
  currency: string;
  costPerMonth: number;
  valuePerMaturityPoint: number;
  exchangeRate?: number | null;
  quickWinThreshold: number;
  maxQuickWinMonths: number;
  isDefault?: boolean;
}

export const EconomicConfigPage = () => {
  const { id: evaluationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [config, setConfig] = useState<EconomicConfig>({
    currency: 'USD',
    costPerMonth: 50000,
    valuePerMaturityPoint: 150000,
    exchangeRate: null,
    quickWinThreshold: 0.2,
    maxQuickWinMonths: 3,
    isDefault: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verificar permisos
  const canEdit = user?.role === 'ADMIN' || user?.role === 'CONSULTANT';

  useEffect(() => {
    if (!canEdit) {
      setError('Solo usuarios ADMIN o CONSULTANT pueden editar la configuración económica');
      setLoading(false);
      return;
    }
    loadConfig();
  }, [evaluationId, canEdit]);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔵 EconomicConfigPage - Loading config for evaluationId:', evaluationId);
      const params = evaluationId ? `?evaluationId=${evaluationId}` : '';
      const response = await api.get(`/economic-config${params}`);
      console.log('🔵 EconomicConfigPage - Config loaded:', response.data);
      setConfig(response.data);
    } catch (err: any) {
      console.error('🔴 EconomicConfigPage - Error loading config:', err);
      console.error('🔴 EconomicConfigPage - Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al cargar configuración';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const data = {
        ...config,
        evaluationId: evaluationId || undefined,
      };

      await api.post('/economic-config', data);
      setSuccess(true);
      
      // Si hay evaluación, ofrecer regenerar roadmap
      if (evaluationId) {
        setTimeout(() => {
          if (window.confirm('¿Deseas regenerar el roadmap con la nueva configuración?')) {
            navigate(`/evaluations/${evaluationId}/dashboard`);
          }
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EconomicConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  if (!canEdit) {
    return (
      <Box p={4}>
        <Alert severity="error">
          No tienes permisos para editar la configuración económica. Solo usuarios ADMIN o CONSULTANT pueden hacerlo.
        </Alert>
      </Box>
    );
  }

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
        <Typography variant="h4">
          Configuración Económica
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadConfig}
        >
          Recargar
        </Button>
      </Box>

      {evaluationId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" component="div">
            <strong>Configuración para esta evaluación:</strong> Esta configuración se aplicará solo a esta evaluación. 
            Si no se configura, se usará la configuración global del tenant.
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            <strong>Nota:</strong> Puedes configurar los valores económicos en cualquier momento, incluso si la evaluación 
            aún no está completa. Esto te permitirá generar el roadmap con los valores correctos cuando esté listo.
          </Typography>
        </Alert>
      )}

      {!evaluationId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta configuración se aplicará globalmente a todas las evaluaciones del tenant que no tengan configuración específica.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Configuración guardada exitosamente
        </Alert>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Moneda</InputLabel>
                <Select
                  value={config.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  label="Moneda"
                >
                  <MenuItem value="USD">USD - Dólar Estadounidense</MenuItem>
                  <MenuItem value="COP">COP - Peso Colombiano</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="MXN">MXN - Peso Mexicano</MenuItem>
                  <MenuItem value="BRL">BRL - Real Brasileño</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tasa de Cambio (opcional)"
                type="number"
                value={config.exchangeRate || ''}
                onChange={(e) =>
                  handleChange('exchangeRate', e.target.value ? parseFloat(e.target.value) : null)
                }
                helperText="Si la moneda no es USD, ingresa la tasa de cambio a USD"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Parámetros de Cálculo
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Costo por Mes de Proyecto"
                type="number"
                value={config.costPerMonth}
                onChange={(e) => handleChange('costPerMonth', parseFloat(e.target.value))}
                helperText={`Costo estimado por mes de trabajo en ${config.currency}`}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor Anual por Punto de Madurez"
                type="number"
                value={config.valuePerMaturityPoint}
                onChange={(e) => handleChange('valuePerMaturityPoint', parseFloat(e.target.value))}
                helperText={`Valor anual estimado por cada punto de madurez ganado en ${config.currency}`}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Configuración de Quick Wins
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Umbral Mínimo de ROI"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={config.quickWinThreshold}
                onChange={(e) => handleChange('quickWinThreshold', parseFloat(e.target.value))}
                helperText="ROI mínimo para considerar una mejora como Quick Win (0.2 = 20%)"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máximo de Meses para Quick Win"
                type="number"
                inputProps={{ min: 1, max: 12 }}
                value={config.maxQuickWinMonths}
                onChange={(e) => handleChange('maxQuickWinMonths', parseInt(e.target.value))}
                helperText="Máximo de meses de esfuerzo para considerar una mejora como Quick Win"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {config.isDefault && (
        <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
          <CardContent>
            <Typography variant="body2" color="info.dark">
              <strong>Nota:</strong> Actualmente estás usando valores por defecto. Guarda una configuración personalizada para adaptar los cálculos a tu contexto.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
