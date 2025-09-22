'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',                 // change to 'dark' if you want
    primary: { main: '#2563eb' },  // blue-600
    background: { default: '#f8fafc' }
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'system-ui', 'Arial'].join(','),
  },
  shape: { borderRadius: 8 },
});