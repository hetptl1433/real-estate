
'use client';

import Layout from '../components/Layout';
import { Typography, Box } from '@mui/material';
import TaxAssessors from '../components/TaxAssessors';

export default function HomePage() {
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Dashboard</Typography>
        <Typography>Welcome! your one stop solution for all Real-Estate needs with power of AI</Typography>
        <Box sx={{ mt: 3 }}>
        </Box>
      </Box>
    </Layout>
  );
}
