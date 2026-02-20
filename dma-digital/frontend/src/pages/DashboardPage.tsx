import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Calculate, Description, TrendingUp, Settings } from '@mui/icons-material';
import { api } from '../services/api';
import { RoadmapView } from '../components/RoadmapView';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const DashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const canEditConfig = user?.role === 'ADMIN' || user?.role === 'CONSULTANT';

  // Debug: Log user and permissions
  useEffect(() => {
    console.log('🔵 DashboardPage - User:', user);
    console.log('🔵 DashboardPage - canEditConfig:', canEditConfig);
    console.log('🔵 DashboardPage - User role:', user?.role);
  }, [user, canEditConfig]);

  useEffect(() => {
    if (id) {
      loadDashboard();
    }
  }, [id]);

  const loadDashboard = async () => {
    try {
      const evaluationRes = await api.get(`/evaluations/${id}`);
      const evaluation = evaluationRes.data;

      // Función para ordenar dimensiones numéricamente (D1, D2, ..., D12)
      const extractDimensionNumber = (code: string): number => {
        const match = code.match(/^D(\d+)$/);
        return match ? parseInt(match[1], 10) : 999;
      };

      // Asegurar que las dimensiones estén ordenadas numéricamente
      const sortedDimensions = [...(evaluation.dimensions || [])].sort((a: any, b: any) => {
        return extractDimensionNumber(a.code) - extractDimensionNumber(b.code);
      });

      // Preparar datos para gráfico radar
      const radarData = sortedDimensions.map((dim: any) => ({
        dimension: dim.code,
        madurez: dim.maturity || 0,
        fullMark: 5,
      }));

      // Preparar datos para gráfico de barras
      const barData = sortedDimensions.map((dim: any) => ({
        name: dim.code,
        madurez: dim.maturity || 0,
      }));

      setData({
        evaluation,
        radarData,
        barData,
      });

      // Debug: Log globalMaturity value
      console.log('🔵 DashboardPage - globalMaturity:', evaluation.globalMaturity);
      console.log('🔵 DashboardPage - globalMaturity type:', typeof evaluation.globalMaturity);
      console.log('🔵 DashboardPage - globalMaturity == null:', evaluation.globalMaturity == null);
      console.log('🔵 DashboardPage - globalMaturity === null:', evaluation.globalMaturity === null);
      console.log('🔵 DashboardPage - globalMaturity === undefined:', evaluation.globalMaturity === undefined);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMaturity = async () => {
    setCalculating(true);
    try {
      await api.post(`/maturity/evaluations/${id}/calculate`);
      await loadDashboard();
    } catch (error) {
      console.error('Error calculating maturity:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      // Verificar que la madurez esté calculada (puede ser 0, pero debe existir)
      if (data?.evaluation?.globalMaturity == null) {
        alert('Debes calcular la madurez primero antes de generar el roadmap. Haz clic en "Calcular Madurez".');
        return;
      }

      await api.post(`/roadmap/evaluations/${id}/roadmap/generate`);
      setTabValue(2); // Cambiar a tab de roadmap
      await loadDashboard();
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      if (error.response?.status === 400) {
        alert(error.response?.data?.error?.message || 'Debes calcular la madurez primero antes de generar el roadmap.');
      } else {
        alert('Error al generar el roadmap. Verifica la consola para más detalles.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography>No hay datos disponibles</Typography>;
  }

  // Verificar si la madurez está calculada (puede ser 0, pero debe existir)
  const globalMaturity = data?.evaluation?.globalMaturity;
  const isMaturityCalculated = globalMaturity != null; // != null verifica tanto null como undefined, pero permite 0

  // Debug log
  console.log('🔵 DashboardPage Render - globalMaturity:', globalMaturity);
  console.log('🔵 DashboardPage Render - isMaturityCalculated:', isMaturityCalculated);
  console.log('🔵 DashboardPage Render - typeof globalMaturity:', typeof globalMaturity);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard de Madurez</Typography>
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
            startIcon={<TrendingUp />}
            onClick={handleGenerateRoadmap}
            disabled={!isMaturityCalculated}
            title={!isMaturityCalculated ? `Debes calcular la madurez primero (actual: ${globalMaturity})` : 'Generar roadmap de mejora'}
          >
            Generar Roadmap
          </Button>
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={() => navigate(`/evaluations/${id}/reports`)}
          >
            Reportes
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => navigate(`/evaluations/${id}/economic-config`)}
            color="secondary"
            disabled={!canEditConfig}
            title={!canEditConfig ? 'Solo usuarios ADMIN o CONSULTANT pueden editar la configuración económica' : 'Configurar valores económicos'}
          >
            Config. Económica
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Resumen" />
        <Tab label="Dimensiones" />
        <Tab label="Roadmap" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Madurez Global
                </Typography>
                <Typography variant="h3" color="primary">
                  {data.evaluation.globalMaturity?.toFixed(2) || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clasificación: {data.evaluation.classification || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progreso
                </Typography>
                <Typography variant="h3" color="primary">
                  {data.evaluation.dimensions?.filter((d: any) => d.maturity).length || 0} / {data.evaluation.dimensions?.length || 12}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dimensiones evaluadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {data.evaluation.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vista General - Madurez por Dimensión
                </Typography>
                <ResponsiveContainer width="100%" height={600}>
                  <RadarChart data={data.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 14 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <Radar
                      name="Madurez"
                      dataKey="madurez"
                      stroke="#0066CC"
                      fill="#0066CC"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Madurez por Dimensión
            </Typography>
            <ResponsiveContainer width="100%" height={600}>
              <BarChart data={data.barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Madurez', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="madurez" fill="#0066CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && id && <RoadmapView evaluationId={id} />}
    </Box>
  );
};
