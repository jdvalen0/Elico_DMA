import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { api } from '../services/api';
import { setCredentials } from '../store/slices/authSlice';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Intentando login...', {
        email,
        apiUrl: import.meta.env.VITE_API_URL || 'https://reggae-legume-calculate.ngrok-free.dev/api',
      });

      const response = await api.post('/auth/login', { email, password });
      console.log('Login exitoso:', response.data);

      const { user, accessToken } = response.data;

      if (!accessToken) {
        throw new Error('No se recibió token de acceso');
      }

      dispatch(setCredentials({ user, token: accessToken }));
      console.log('Credenciales guardadas, redirigiendo...');
      navigate('/');
    } catch (err: any) {
      console.error('Error en login:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });

      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error') || err.code === 'ECONNABORTED') {
        setError('Error de conexión. Verifica que el backend esté corriendo en http://localhost:3001 (o que arrancar.sh esté en ejecución).');
      } else if (err.response?.status === 401) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Por favor intenta más tarde.');
      } else {
        setError(err.response?.data?.error?.message || 'Error al iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            DMA Digital ELICO 4.0
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form 
            onSubmit={handleSubmit}
            autoComplete="off"
            noValidate
          >
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="off"
              autoFocus
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="off"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !email || !password}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
