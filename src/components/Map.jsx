'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl, Source, Layer } from 'react-map-gl';
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

export default function MapboxMap({ initialView = DEFAULT_VIEW, pins = demoPins, geojson = null, enableTerrain = false }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  const mapStyle = useMemo(
    () => 'mapbox://styles/mapbox/streets-v12',
    []
  );

  const onMarkerClick = useCallback((pin, e) => {
    e.originalEvent.stopPropagation(); // prevent map click
    setPopupInfo(pin);
  }, []);

  // Auto-fit to GeoJSON bounds when provided
  useEffect(() => {
    if (!geojson || !geojson.features?.length || !mapRef.current) return;
    const coords = geojson.features
      .map((f) => f.geometry?.coordinates)
      .filter((c) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]));
    if (!coords.length) return;
    let minLng = coords[0][0], minLat = coords[0][1], maxLng = coords[0][0], maxLat = coords[0][1];
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
    try {
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 800 }
      );
    } catch {}
  }, [geojson]);

  return (
    <Box sx={{ height: '100%', minHeight: 400, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <Map
        ref={mapRef}
        initialViewState={initialView}
        mapStyle={mapStyle}
        mapboxAccessToken={token}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setPopupInfo(null)}
        interactiveLayerIds={geojson ? ['assessor-circles'] : undefined}
        onMouseMove={(e) => {
          if (!geojson) return;
          const f = e.features && e.features[0];
          if (f && f.layer && f.layer.id === 'assessor-circles') {
            const { lng, lat } = e.lngLat;
            setHoverInfo({ longitude: lng, latitude: lat, properties: f.properties || {} });
          } else {
            setHoverInfo(null);
          }
        }}
        onLoad={(e) => {
          if (!enableTerrain) return;
          const map = e.target;
          if (!map.getSource('mapbox-dem')) {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            });
          }
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
          if (!map.getLayer('sky')) {
            map.addLayer({
              id: 'sky',
              type: 'sky',
              paint: {
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun-intensity': 15,
              },
            });
          }
        }}
      >
        {/* UX helpers */}
        <NavigationControl position="top-right" />
        <ScaleControl />

        {/* GeoJSON source + circle layer (preferred if provided) */}
        {geojson && (
          <Source id="assessor-points" type="geojson" data={geojson}>
            <Layer
              id="assessor-circles"
              type="circle"
              source="assessor-points"
              paint={{
                'circle-radius': [
                  'interpolate', ['linear'], ['zoom'],
                  8, 2,
                  12, 5,
                  16, 8
                ],
                'circle-color': '#1976d2',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.85,
              }}
            />
          </Source>
        )}

        {/* Fallback demo markers if no geojson provided */}
        {!geojson && pins.map((pin) => (
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
        {!geojson && popupInfo && (
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

        {/* Hover tooltip for GeoJSON circles */}
        {geojson && hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            anchor="top"
            closeButton={false}
            closeOnMove
            maxWidth="260px"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {hoverInfo.properties.address || 'Unknown address'}
            </Typography>
            {hoverInfo.properties.parcel_id && (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Parcel: {hoverInfo.properties.parcel_id}
              </Typography>
            )}
          </Popup>
        )}
      </Map>
    </Box>
  );
}
