'use client';

import Layout from '../../components/Layout';
import MapboxMap from '../../components/Map';
import { Box, Typography } from '@mui/material';
import TaxAssessors from '../../components/TaxAssessors';
import { useCallback, useState } from 'react';

// Load data via TaxAssessors and pass GeoJSON up using onData

export default function MapPage() {
  const [geojson, setGeojson] = useState(null);
  const handleData = useCallback(({ geojson }) => {
    setGeojson(geojson);
  }, []);

  return (
    <Layout>
      <Box sx={{ p: 3, display: 'grid', gap: 2 }}>
        <Typography variant="h5">Real Estate Map</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          New York Area
        </Typography>
        {/* Hidden data loader that fetches assessors and passes GeoJSON up */}
        <TaxAssessors renderList={false} onData={handleData} />
        {/* Always render the map. It shows demo pins until geojson arrives. */}
        <MapboxMap geojson={geojson} enableTerrain={false} />
      </Box>
    </Layout>
  );
}
