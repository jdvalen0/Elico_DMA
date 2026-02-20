import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Assessment, Dashboard, PhotoLibrary, Description, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { RouteDebugger } from './RouteDebugger';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Inicio', icon: <Home />, path: '/' },
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Evidencias', icon: <PhotoLibrary />, path: '/evidence' },
  { text: 'Reportes', icon: <Description />, path: '/reports' },
];

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🟡 Layout - Component mounted');
  }, []);

  // Debug: Log navigation
  useEffect(() => {
    console.log('🔵 Layout - Current location:', location.pathname);
    console.log('🔵 Layout - Location object:', location);
  }, [location]);

  const handleNavigation = (path: string) => {
    console.log('🟢 Layout - handleNavigation called with path:', path);
    console.log('🟢 Layout - Current pathname before navigation:', location.pathname);
    console.log('🟢 Layout - Current URL:', window.location.href);
    console.log('🟢 Layout - navigate function exists:', typeof navigate === 'function');
    
    // Prevenir navegación si ya estamos en esa ruta
    if (location.pathname === path) {
      console.log('🟡 Layout - Ya estamos en esa ruta, ignorando navegación');
      return;
    }
    
    try {
      // FORZAR navegación usando window.location como fallback
      console.log('🟢 Layout - Attempting navigation to:', path);
      navigate(path, { replace: false });
      
      // Fallback: si después de 200ms no cambió, usar window.location
      setTimeout(() => {
        if (location.pathname !== path) {
          console.warn('🟡 Layout - Navigation did not work, using window.location as fallback');
          window.location.href = path;
        } else {
          console.log('✅ Layout - Navigation successful! New pathname:', location.pathname);
        }
      }, 200);
    } catch (error) {
      console.error('🔴 Layout - Error during navigation:', error);
      // Fallback directo
      console.log('🟡 Layout - Using window.location as fallback');
      window.location.href = path;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            DMA Digital ELICO 4.0
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🟣 ListItemButton - Click detected for:', item.text, 'path:', item.path);
                    console.log('🟣 ListItemButton - Event:', e);
                    console.log('🟣 ListItemButton - Current URL:', window.location.href);
                    
                    // TEST DIRECTO: Intentar navegación inmediata
                    if (item.path === '/evidence') {
                      console.log('🔴 TEST DIRECTO - Navegando a /evidence');
                      window.location.href = '/evidence';
                      return;
                    }
                    
                    handleNavigation(item.path);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar />
        <RouteDebugger />
        <Outlet />
      </Box>
    </Box>
  );
};
