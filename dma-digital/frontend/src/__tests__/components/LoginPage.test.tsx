import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from '../../pages/LoginPage';
import authReducer from '../../store/slices/authSlice';

// Mock del servicio API
const mockPost = vi.fn();
vi.mock('../../services/api', () => ({
  api: {
    post: mockPost,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock de react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    vi.clearAllMocks();
    mockPost.mockClear();
  });

  const renderLoginPage = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
  };

  it('debe renderizar el formulario de login', () => {
    renderLoginPage();

    expect(screen.getByText('DMA Digital ELICO 4.0')).toBeInTheDocument();
    // Hay dos elementos con "Iniciar Sesión" - el título y el botón, verificamos ambos
    expect(screen.getAllByText(/iniciar sesión/i).length).toBeGreaterThanOrEqual(1);
    // Material-UI TextField con type="email" se renderiza como textbox
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Campo de contraseña
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe validar campos requeridos', () => {
    renderLoginPage();

    const emailInput = screen.getByRole('textbox') as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;

    // Verificar que los campos están vacíos y son requeridos
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('debe hacer login exitoso con credenciales válidas', async () => {
    const user = userEvent.setup();
    
    mockPost.mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        accessToken: 'mock-token',
      },
    });

    renderLoginPage();

    await user.type(screen.getByRole('textbox'), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('debe mostrar error cuando las credenciales son inválidas', async () => {
    const user = userEvent.setup();
    
    mockPost.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Credenciales inválidas',
          },
        },
      },
    });

    renderLoginPage();

    await user.type(screen.getByRole('textbox'), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  it('debe mostrar estado de carga durante el login', async () => {
    const user = userEvent.setup();
    
    // Simular una respuesta lenta
    mockPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                user: { id: '1', email: 'test@example.com' },
                accessToken: 'mock-token',
              },
            });
          }, 100);
        })
    );

    renderLoginPage();

    await user.type(screen.getByRole('textbox'), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
  });
});
