import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import { Download, Description, Refresh } from '@mui/icons-material';
import { api } from '../services/api';

interface Evaluation {
  id: string;
  name: string;
  company: string;
  status: string;
  globalMaturity?: number;
  classification?: string;
}

export const ReportsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>(id || '');
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'regulatory'>('executive');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const consecutive404Ref = useRef<number>(0); // Contador de 404 consecutivos

  useEffect(() => {
    loadEvaluations();
    if (id) {
      setSelectedEvaluation(id);
    }
  }, [id]);

  // Detener polling si existe
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('🛑 ReportsPage - Stopping polling interval', pollingIntervalRef.current);
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      isPollingRef.current = false;
      consecutive404Ref.current = 0; // Resetear contador
      console.log('🛑 ReportsPage - Polling stopped, interval cleared');
    } else {
      console.log('🟡 ReportsPage - stopPolling called but no interval exists');
    }
  };

  useEffect(() => {
    // Si no hay jobId, detener polling y salir
    if (!jobId) {
      stopPolling();
      return;
    }

    // Si no está en processing, no hacer nada
    if (jobStatus?.status !== 'processing') {
      stopPolling();
      return;
    }

    // Si ya está haciendo polling, no crear otro
    if (isPollingRef.current) {
      console.log('🟡 ReportsPage - Already polling, skipping');
      return;
    }

    console.log('🔄 ReportsPage - Starting polling for job:', jobId);
    isPollingRef.current = true;
    let pollCount = 0;
    const maxPolls = 60; // Máximo 2 minutos (60 * 2 segundos)
    const currentJobId = jobId; // Capturar el jobId actual
    
    const interval = setInterval(async () => {
      // Verificar que el jobId no haya cambiado
      if (currentJobId !== jobId || !jobId) {
        console.log('🛑 ReportsPage - JobId changed or is null, stopping polling');
        stopPolling();
        return;
      }

      pollCount++;
      console.log(`🔄 ReportsPage - Polling attempt ${pollCount}/${maxPolls} for job:`, currentJobId);
      
      if (pollCount >= maxPolls) {
        console.error('⏱️ ReportsPage - Timeout: Maximum polling attempts reached');
        stopPolling();
        setError('El reporte está tardando más de lo esperado. Por favor intenta de nuevo.');
        setGenerating(false);
        setJobStatus(null);
        setJobId(null);
        return;
      }
      
      // checkJobStatus retorna false si debe detenerse
      const shouldContinue = await checkJobStatus();
      if (!shouldContinue) {
        console.log('🛑 ReportsPage - checkJobStatus returned false, stopping polling');
        stopPolling();
        return;
      }
    }, 2000); // Verificar cada 2 segundos
    
    pollingIntervalRef.current = interval;
    
    return () => {
      console.log('🔄 ReportsPage - Cleaning up polling interval (useEffect cleanup)');
      stopPolling();
    };
  }, [jobId, jobStatus?.status]); // Dependemos de jobId y jobStatus.status

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/evaluations');
      const evaluationsData = response.data.data || [];
      setEvaluations(evaluationsData);
      if (evaluationsData.length > 0 && !selectedEvaluation) {
        setSelectedEvaluation(evaluationsData[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const checkJobStatus = async (): Promise<boolean> => {
    const currentJobId = jobId; // Capturar el jobId actual
    
    if (!currentJobId) {
      console.warn('⚠️ ReportsPage - checkJobStatus called without jobId');
      stopPolling();
      return false; // Indica que debe detenerse
    }
    
    try {
      console.log('🔍 ReportsPage - Checking job status for:', currentJobId);
      const response = await api.get(`/reports/${currentJobId}/status`);
      console.log('📊 ReportsPage - Job status response:', response.data);
      
      // Verificar que el jobId no haya cambiado durante la petición
      if (currentJobId !== jobId) {
        console.log('🟡 ReportsPage - JobId changed during check, ignoring response');
        stopPolling();
        return false;
      }
      
      setJobStatus(response.data);
      
      if (response.data.status === 'completed') {
        console.log('✅ ReportsPage - Job completed! Downloading report...');
        stopPolling();
        setSnackbar({ open: true, message: 'Reporte generado exitosamente' });
        await downloadReport();
        return false; // Detener polling
      } else if (response.data.status === 'failed') {
        console.error('❌ ReportsPage - Job failed:', response.data.error);
        stopPolling();
        setError(response.data.error || 'Error al generar reporte');
        setGenerating(false);
        setJobStatus(null);
        setJobId(null);
        return false; // Detener polling
      } else if (response.data.status === 'processing') {
        console.log('⏳ ReportsPage - Job still processing...');
        // Actualizar progreso si está disponible
        if (response.data.progress !== undefined) {
          console.log('📈 ReportsPage - Progress:', response.data.progress + '%');
        }
        return true; // Continuar polling
      }
      return true; // Continuar por defecto
    } catch (err: any) {
      console.error('🔴 ReportsPage - Error checking job status:', err);
      console.error('🔴 ReportsPage - Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      
      // Si el job no existe, puede haber expirado o haber un error
      if (err.response?.status === 404) {
        consecutive404Ref.current += 1;
        console.error(`❌ ReportsPage - Job not found (404). Attempt ${consecutive404Ref.current}.`);
        console.error('❌ ReportsPage - JobId that failed:', currentJobId);
        
        // Si hay 2 o más 404 consecutivos, detener inmediatamente
        if (consecutive404Ref.current >= 2) {
          console.error('🚨 ReportsPage - Multiple 404 errors detected. Stopping polling IMMEDIATELY.');
          
          // DETENER POLLING INMEDIATAMENTE
          stopPolling();
          
          setError('El trabajo de generación no se encontró después de múltiples intentos. El servidor puede haberse reiniciado o el job expiró. Por favor intenta generar el reporte de nuevo.');
          setGenerating(false);
          setJobStatus(null);
          setJobId(null);
          
          return false; // Detener polling
        } else {
          // Primer 404, intentar una vez más
          console.warn('⚠️ ReportsPage - First 404, will try once more before stopping');
          return true; // Continuar una vez más
        }
      } else {
        // Si no es 404, resetear el contador
        consecutive404Ref.current = 0;
      }
      
      // Para otros errores, continuar intentando (puede ser temporal)
      console.warn('⚠️ ReportsPage - Non-404 error, will retry');
      return true; // Continuar polling si es otro error
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedEvaluation) {
      setError('Selecciona una evaluación');
      return;
    }

    // Detener cualquier polling anterior
    stopPolling();
    consecutive404Ref.current = 0; // Resetear contador de 404
    
    setGenerating(true);
    setError('');
    setJobStatus(null);
    setJobId(null);

    try {
      const response = await api.post(`/reports/evaluations/${selectedEvaluation}/reports/generate`, {
        type: reportType,
        options: {},
      });
      
      setJobId(response.data.jobId);
      setJobStatus({ status: 'processing', progress: 0 });
      setSnackbar({ open: true, message: 'Generando reporte...' });
      
      // Iniciar polling
      checkJobStatus();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al generar reporte');
      setGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!jobId) return;

    try {
      const response = await api.get(`/reports/${jobId}/download`, {
        responseType: 'blob',
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reportType}-${selectedEvaluation}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setGenerating(false);
      setJobId(null);
      setJobStatus(null);
      setSnackbar({ open: true, message: 'Reporte descargado exitosamente' });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al descargar reporte');
      setGenerating(false);
    }
  };

  const handleDownloadDirect = async () => {
    if (!selectedEvaluation) {
      setError('Selecciona una evaluación');
      return;
    }

    // Generar y descargar directamente
    await handleGenerateReport();
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
        <Typography variant="h4">Reportes</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadEvaluations}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {jobStatus?.status === 'processing' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Generando reporte...
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  console.log('🛑 ReportsPage - User cancelled report generation');
                  stopPolling();
                  setGenerating(false);
                  setJobStatus(null);
                  setJobId(null);
                  setError('');
                }}
              >
                Cancelar
              </Button>
            </Box>
            <LinearProgress variant="indeterminate" sx={{ mt: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Por favor espera, esto puede tomar unos momentos...
            </Typography>
            {jobId && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Job ID: {jobId}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seleccionar Evaluación
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Evaluación</InputLabel>
                <Select
                  value={selectedEvaluation}
                  onChange={(e) => setSelectedEvaluation(e.target.value)}
                  label="Evaluación"
                >
                  {evaluations.map((evaluation) => (
                    <MenuItem key={evaluation.id} value={evaluation.id}>
                      {evaluation.name} - {evaluation.company}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedEvaluation && (
                <Box sx={{ mt: 2 }}>
                  {(() => {
                    const evaluation = evaluations.find((e) => e.id === selectedEvaluation);
                    return evaluation ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Empresa: {evaluation.company}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Estado: {evaluation.status}
                        </Typography>
                        {evaluation.globalMaturity != null && (
                          <Typography variant="body2" color="text.secondary">
                            Madurez: {evaluation.globalMaturity.toFixed(2)} / 5.0
                          </Typography>
                        )}
                        {evaluation.classification && (
                          <Typography variant="body2" color="primary">
                            {evaluation.classification}
                          </Typography>
                        )}
                      </Box>
                    ) : null;
                  })()}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tipo de Reporte
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  label="Tipo"
                >
                  <MenuItem value="executive">Ejecutivo</MenuItem>
                  <MenuItem value="technical">Técnico</MenuItem>
                  <MenuItem value="regulatory">Normativo</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ejecutivo:</strong> Resumen para alta dirección
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Técnico:</strong> Detalle técnico completo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Normativo:</strong> Cumplimiento normativo
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" gap={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  onClick={handleDownloadDirect}
                  disabled={!selectedEvaluation || generating}
                >
                  {generating ? 'Generando...' : 'Generar y Descargar Reporte'}
                </Button>
                {selectedEvaluation && (
                  <Button
                    variant="outlined"
                    startIcon={<Description />}
                    onClick={() => navigate(`/evaluations/${selectedEvaluation}`)}
                  >
                    Ver Evaluación
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};
