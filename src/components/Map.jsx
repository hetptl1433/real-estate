'use client';

import { useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl } from 'react-map-gl';
import { Box, Typography } from '@mui/material';

const DEFAULT_VIEW = {
  latitude: 41.8781,   // Chicago IL
  longitude: -87.6298,
  zoom: 10
};

// Demo data: three pins
const demoPins = [
  { id: 'p1', name: 'IIT CHICAGO', lat: 41.881, lng: -87.63, note: 'Downtown' },
  { id: 'p2', name: 'Start building', lat: 41.9,   lng: -87.64, note: 'North side' },
  { id: 'p3', name: 'Praire shores ', lat: 41.86,  lng: -87.62, note: 'South loop' }
];

export default function MapboxMap({ initialView = DEFAULT_VIEW, pins = demoPins }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [popupInfo, setPopupInfo] = useState(null);

  const mapStyle = useMemo(
    () => 'mapbox://styles/mapbox/streets-v12',
    []
  );

  const onMarkerClick = useCallback((pin, e) => {
    e.originalEvent.stopPropagation(); // prevent map click
    setPopupInfo(pin);
  }, []);

  return (
    <Box sx={{ height: '100%', minHeight: 400, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <Map
        initialViewState={initialView}
        mapStyle={mapStyle}
        mapboxAccessToken={token}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setPopupInfo(null)}
      >
        {/* UX helpers */}
        <NavigationControl position="top-right" />
        <ScaleControl />

        {/* Markers */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            latitude={pin.lat}
            longitude={pin.lng}
            anchor="bottom"
            onClick={(e) => onMarkerClick(pin, e)}
          >
            {/* Simple custom marker (MUI-styled dot) */}
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: '2px solid white',
                boxShadow: 2,
                cursor: 'pointer'
              }}
              title={pin.name}
            />
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            latitude={popupInfo.lat}
            longitude={popupInfo.lng}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            maxWidth="240px"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{popupInfo.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>{popupInfo.note}</Typography>
          </Popup>
        )}
      </Map>
    </Box>
  );
}