import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateEvaluationPage } from './pages/CreateEvaluationPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardListPage } from './pages/DashboardListPage';
import { EvidencePage } from './pages/EvidencePage';
import { EvidenceListPage } from './pages/EvidenceListPage';
import { ReportsPage } from './pages/ReportsPage';
import { EconomicConfigPage } from './pages/EconomicConfigPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { setCredentials } from './store/slices/authSlice';
import { api } from './services/api';
import { RootState } from './store';

function App() {
  console.log('🟡 App - Component rendered');
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  // Restaurar usuario desde token al iniciar la app
  useEffect(() => {
    const restoreUser = async () => {
      // Si ya hay usuario, no hacer nada
      if (user) {
        console.log('🔵 App - User already loaded:', user);
        return;
      }

      // Si hay token pero no usuario, intentar cargar usuario
      const storedToken = localStorage.getItem('token');
      if (storedToken && !user) {
        console.log('🔵 App - Token found, loading user...');
        try {
          const response = await api.get('/auth/me');
          console.log('🔵 App - User loaded from /me:', response.data);
          dispatch(setCredentials({ user: response.data, token: storedToken }));
        } catch (error: any) {
          console.error('🔴 App - Error loading user:', error);
          // Si el token es inválido, limpiar
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
          }
        }
      }
    };

    restoreUser();
  }, [user, dispatch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          {/* Rutas para navegación desde el menú */}
          <Route path="dashboard" element={<DashboardListPage />} />
          <Route path="evidence" element={<EvidenceListPage />} />
          <Route path="reports" element={<ReportsPage />} />
          {/* Rutas de evaluaciones */}
          <Route path="evaluations/new" element={<CreateEvaluationPage />} />
          <Route path="evaluations/:id" element={<EvaluationPage />} />
          <Route path="evaluations/:id/dashboard" element={<DashboardPage />} />
          <Route path="evaluations/:id/evidence" element={<EvidencePage />} />
          <Route path="evaluations/:id/reports" element={<ReportsPage />} />
          <Route path="evaluations/:id/economic-config" element={<EconomicConfigPage />} />
          <Route path="economic-config" element={<EconomicConfigPage />} />
        </Route>
        {/* Catch-all debe estar fuera del Layout para evitar redirecciones incorrectas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
