'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import AuthProvider from '../components/AuthProvider';

// If you want MUI theme support:
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

export function Providers({ children }) {
  return (
    <AuthProvider>  
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}