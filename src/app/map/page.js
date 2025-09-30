'use client';

import Layout from '../../components/Layout';
import MapboxMap from '../../components/Map';
import { Box, Typography } from '@mui/material';

export default function MapPage() {
  return (
    <Layout>
      <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
        <Typography variant="h5">Real Estate Map</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Chicago Area 
        </Typography>
        <MapboxMap />
      </Box>
    </Layout>
  );
}