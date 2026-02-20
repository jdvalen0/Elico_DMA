import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Calculate, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DimensionForm } from '../components/DimensionForm';
import { OfflineIndicator } from '../components/OfflineIndicator';

interface Dimension {
  id: string;
  code: string;
  name: string;
  maturity?: number;
  subcriteria: Subcriterion[];
}

interface Subcriterion {
  id: string;
  code: string;
  name: string;
  maturity?: number;
}

export const EvaluationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedDimension, setSelectedDimension] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvaluation();
    }
  }, [id]);

  const loadEvaluation = async () => {
    try {
      const response = await api.get(`/evaluations/${id}`);
      setEvaluation(response.data);
      setDimensions(response.data.dimensions || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMaturity = async () => {
    setCalculating(true);
    try {
      await api.post(`/maturity/evaluations/${id}/calculate`);
      await loadEvaluation();
      alert('Madurez calculada exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al calcular madurez');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          {evaluation?.name || 'Evaluación de Madurez Digital'}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Calculate />}
            onClick={handleCalculateMaturity}
            disabled={calculating}
          >
            {calculating ? 'Calculando...' : 'Calcular Madurez'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Dashboard />}
            onClick={() => navigate(`/evaluations/${id}/dashboard`)}
          >
            Dashboard
          </Button>
        </Box>
      </Box>

      {id && <OfflineIndicator evaluationId={id} />}

      {evaluation && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Empresa
                </Typography>
                <Typography variant="h6">{evaluation.company}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Madurez Global
                </Typography>
                <Typography variant="h6">
                  {evaluation.globalMaturity?.toFixed(2) || 'N/A'} / 5.0
                </Typography>
                {evaluation.classification && (
                  <Typography variant="body2" color="primary">
                    {evaluation.classification}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Estado
                </Typography>
                <Typography variant="h6">{evaluation.status}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Tabs
        value={selectedDimension}
        onChange={(_, newValue) => setSelectedDimension(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {dimensions.map((dim, index) => (
          <Tab
            key={dim.id}
            label={`${dim.code}`}
            {...(index === 0 ? { id: 'tab-0' } : {})}
          />
        ))}
      </Tabs>

      {dimensions[selectedDimension] && (
        <DimensionForm
          dimension={dimensions[selectedDimension]}
          evaluationId={id!}
          onUpdate={loadEvaluation}
        />
      )}
    </Box>
  );
};
