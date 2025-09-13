'use client';

import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateRows: '56px 1fr', height: '100vh' }}>
      <Header />
      <Box sx={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 0 }}>
        <Sidebar />
        <Box sx={{ overflow: 'auto', bgcolor: '#fafafa' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
