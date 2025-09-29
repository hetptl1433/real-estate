'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import AuthProvider from '../components/AuthProvider';

// If you want MUI theme support:
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { ApolloProvider } from '@apollo/client/react';
import client from '../lib/apolloClient';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ApolloProvider>
    </AuthProvider>
  );
}
