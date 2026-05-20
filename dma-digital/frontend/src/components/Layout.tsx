import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';

import {
  Dashboard,
  PhotoLibrary,
  Description,
  Home,
  Logout,
} from '@mui/icons-material';

import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';
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
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    console.log('🔵 Current route:', location.pathname);
  }, [location]);

  const handleNavigation = (path: string) => {
    if (location.pathname === path) return;

    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          boxSizing: 'border-box',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            DMA Digital ELICO 4.0
          </Typography>

          {user && (
            <>
              <Typography
                variant="body2"
                sx={{
                  mr: 2,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={user.email}
              >
                {user.email}
              </Typography>

              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
                size="small"
              >
                Cerrar
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />

        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={
                    location.pathname === item.path ||
                    (item.path !== '/' &&
                      location.pathname.startsWith(item.path))
                  }
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>

                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          minWidth: 0,
          overflowX: 'hidden',

          p: 3,
          pt: 10,
        }}
      >
        <RouteDebugger />

        <Box
          sx={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};