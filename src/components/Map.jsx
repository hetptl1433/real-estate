'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl, Source, Layer } from 'react-map-gl';
import { Box, Typography, Autocomplete, TextField, CircularProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_REONOMY_PROPERTIES } from '../lib/queries/reonomyProperties';
import { GET_PARCEL_BY_LOCATION } from '../lib/queries/getParcelByLocation';
import { DEFAULT_SETTINGS, readStoredSettings, SETTINGS_STORAGE_KEY } from '../lib/userSettings';

const DEFAULT_VIEW = {
  latitude: 40.7128,   // New York, NY
  longitude: -74.0060,
  zoom: 10
};

// Demo data: three pins
const demoPins = [
  { id: 'p1', name: 'IIT CHICAGO', lat: 41.881, lng: -87.63, note: 'Downtown' },
  { id: 'p2', name: 'Start building', lat: 41.9,   lng: -87.64, note: 'North side' },
  { id: 'p3', name: 'Praire shores ', lat: 41.86,  lng: -87.62, note: 'South loop' }
];

export default function MapboxMap({
  initialView = DEFAULT_VIEW,
  pins = demoPins,
  geojson = null,
  enableTerrain = false,
  autoFitGeojson = true,
  onLocationChange = null,
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const hoveredParcelIdRef = useRef(null);
  const selectedParcelIdRef = useRef(null);
  const [hoveredParcelId, setHoveredParcelId] = useState(null);
  const [hoverGeom, setHoverGeom] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);
  const geocoderRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const autocompleteSeqRef = useRef(0);
  const [lastResolvedLocation, setLastResolvedLocation] = useState(null);
  const [shouldOpenStreetView, setShouldOpenStreetView] = useState(false);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState(null);
  const [streetViewAddress, setStreetViewAddress] = useState('');
  const [autoStreetViewEnabled, setAutoStreetViewEnabled] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS.autoOpenStreetView;
    return readStoredSettings().autoOpenStreetView;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const refresh = () => {
      setAutoStreetViewEnabled(readStoredSettings().autoOpenStreetView);
    };
    refresh();
    const handleStorage = (event) => {
      if (!event || event.key === SETTINGS_STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (autoStreetViewEnabled && selectedParcelId && lastResolvedLocation) {
      setShouldOpenStreetView(true);
    }
  }, [autoStreetViewEnabled, selectedParcelId, lastResolvedLocation]);
  const [fetchParcelByLocation, { loading: parcelLookupLoading, error: parcelLookupError }] = useLazyQuery(
    GET_PARCEL_BY_LOCATION,
    { fetchPolicy: 'network-only' }
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!googleMapsApiKey) {
      setSearchError('Google Maps API key missing. Address search unavailable.');
      return;
    }

    const initGoogle = () => {
      if (!window.google?.maps) return;
      geocoderRef.current = geocoderRef.current || new window.google.maps.Geocoder();
      if (window.google.maps.places) {
        autocompleteServiceRef.current =
          autocompleteServiceRef.current || new window.google.maps.places.AutocompleteService();
      }
      setGoogleReady(true);
      setSearchError(null);
    };

    if (window.google?.maps?.places) {
      initGoogle();
      return;
    }

    const scriptId = 'google-maps-sdk';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      const onExistingLoad = () => initGoogle();
      existingScript.addEventListener('load', onExistingLoad);
      return () => {
        existingScript.removeEventListener('load', onExistingLoad);
      };
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    const handleLoad = () => initGoogle();
    const handleError = () => {
      setGoogleReady(false);
      setSearchError('Unable to load Google Maps. Please try again later.');
    };
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [googleMapsApiKey]);
  const getFeatureId = useCallback((feature) => {
    if (!feature) return null;
    const propId = feature.properties?.ID;
    if (propId != null && String(propId).trim() !== '') {
      return String(propId).trim();
    }
    if (feature.id != null) {
      return String(feature.id).trim();
    }
    return null;
  }, []);

  const clearParcelSelection = useCallback(() => {
    const map = mapRef.current?.getMap?.() ?? mapRef.current;
    const currentId = selectedParcelIdRef.current;
    if (map && currentId) {
      try {
        map.setFeatureState(
          { source: 'parcels', sourceLayer: 'attom-parcels', id: currentId },
          { selected: false }
        );
      } catch {}
    }
    selectedParcelIdRef.current = null;
    setSelectedParcelId(null);
  }, []);

  const selectParcelById = useCallback((rawId) => {
    if (rawId == null) {
      clearParcelSelection();
      return;
    }

    const map = mapRef.current?.getMap?.() ?? mapRef.current;
    const id = String(rawId).trim();
    if (!id) {
      clearParcelSelection();
      return;
    }

    if (map) {
      const previousId = selectedParcelIdRef.current;
      if (previousId && previousId !== id) {
        try {
          map.setFeatureState(
            { source: 'parcels', sourceLayer: 'attom-parcels', id: previousId },
            { selected: false }
          );
        } catch {}
      }
      try {
        map.setFeatureState(
          { source: 'parcels', sourceLayer: 'attom-parcels', id },
          { selected: true }
        );
      } catch {}
    }

    selectedParcelIdRef.current = id;
    setSelectedParcelId(id);
  }, [clearParcelSelection]);

  const fetchPlacePredictions = useCallback(
    (input) =>
      new Promise((resolve, reject) => {
        const service = autocompleteServiceRef.current;
        if (!service || !window.google?.maps?.places) {
          resolve([]);
          return;
        }
        const requestId = ++autocompleteSeqRef.current;
        service.getPlacePredictions(
          {
            input,
            componentRestrictions: { country: 'us' },
          },
          (predictions, status) => {
            if (requestId !== autocompleteSeqRef.current) return;
            if (
              status !== window.google.maps.places.PlacesServiceStatus.OK &&
              status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              reject(new Error('Unable to fetch address suggestions.'));
              return;
            }
            if (!predictions || predictions.length === 0) {
              resolve([]);
              return;
            }
            resolve(
              predictions.map((prediction) => ({
                label: prediction.description,
                placeId: prediction.place_id,
              }))
            );
          }
        );
      }),
    []
  );

  const geocodeRequest = useCallback(
    (params) =>
      new Promise((resolve, reject) => {
        const geocoder = geocoderRef.current;
        if (!geocoder) {
          reject(new Error('Google geocoder unavailable.'));
          return;
        }

        geocoder.geocode(params, (results, status) => {
          if (status !== 'OK' || !results?.length) {
            reject(new Error('No matching address found.'));
            return;
          }
          const best = results[0];
          const location = best?.geometry?.location;
          const lat = location?.lat();
          const lng = location?.lng();
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            reject(new Error('Invalid coordinates returned for that address.'));
            return;
          }
          const components = Array.isArray(best?.address_components) ? best.address_components : [];
          const findComponent = (...types) => {
            const match = components.find((component) => types.some((type) => component.types?.includes(type)));
            return match?.long_name ?? null;
          };
          const stateComponent = components.find((component) =>
            component.types?.includes('administrative_area_level_1')
          );
          resolve({
            lat,
            lng,
            address: best.formatted_address ?? params.address ?? '',
            city: findComponent('locality', 'postal_town', 'sublocality', 'administrative_area_level_2'),
            state: stateComponent?.short_name ?? stateComponent?.long_name ?? null,
          });
        });
      }),
    []
  );

  const handleResolvedLocation = useCallback(
    async ({ lat, lng, address, city, state }) => {
      const map = mapRef.current?.getMap?.() ?? mapRef.current;
      if (map && Number.isFinite(lat) && Number.isFinite(lng)) {
        try {
          map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom?.() ?? 16, 16), duration: 1200 });
        } catch {}
      }

      const locationPayload = { lat, lng, address, city: city ?? null, state: state ?? null };
      setLastResolvedLocation(locationPayload);
      if (typeof onLocationChange === 'function') {
        onLocationChange(locationPayload);
      }
      setSearchError(null);

      try {
        const { data } = await fetchParcelByLocation({
          variables: { latitude: lat, longitude: lng },
        });
        const parcelId = data?.executeGetParcelByLocation?.parcel_id ?? null;
        if (parcelId) {
          selectParcelById(parcelId);
          if (autoStreetViewEnabled) {
            setShouldOpenStreetView(true);
          } else {
            setShouldOpenStreetView(false);
          }
        } else {
          setSearchError('No parcel found for that location.');
          setShouldOpenStreetView(false);
          selectParcelById(null);
        }
      } catch (error) {
        console.error(error);
        let friendlyMessage =
          error?.graphQLErrors?.[0]?.message ??
          (typeof error?.message === 'string' ? error.message : null);

        if (!friendlyMessage && error?.networkError?.statusCode === 400) {
          friendlyMessage = 'No parcel found for that location.';
        } else if (friendlyMessage === 'Response not successful: Received status code 400') {
          friendlyMessage = 'No parcel found for that location.';
        }

        setSearchError(friendlyMessage ?? 'Unable to look up parcel for that location.');
        setShouldOpenStreetView(false);
        selectParcelById(null);
      }
    },
    [autoStreetViewEnabled, fetchParcelByLocation, onLocationChange, selectParcelById]
  );

  const handleSearchSelection = useCallback(
    async (_event, option) => {
      if (!option) return;
      const selection = typeof option === 'string' ? { label: option, placeId: null } : option;
      if (!selection.placeId && !selection.label) return;
      setSearchLoading(true);
      try {
        const result = await geocodeRequest(
          selection.placeId ? { placeId: selection.placeId } : { address: selection.label }
        );
        setSearchInput(selection.label ?? '');
        setSearchOptions([]);
        await handleResolvedLocation(result);
      } catch (error) {
        setSearchError(error?.message ?? 'Unable to resolve that address.');
      } finally {
        setSearchLoading(false);
      }
    },
    [geocodeRequest, handleResolvedLocation]
  );

  const handleInputChange = useCallback(
    async (_event, value, reason) => {
      setSearchInput(value);
      if (reason === 'clear') {
        setSearchOptions([]);
        setSearchError(null);
        return;
      }
      if (reason !== 'input') return;
      if (!value || !googleReady) {
        setSearchOptions([]);
        return;
      }

      setSearchLoading(true);
      try {
        const predictions = await fetchPlacePredictions(value);
        setSearchOptions(predictions);
      } catch (error) {
        setSearchOptions([]);
        setSearchError(error?.message ?? 'Unable to load suggestions.');
      } finally {
        setSearchLoading(false);
      }
    },
    [fetchPlacePredictions, googleReady]
  );

  const handleSearchSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!searchInput?.trim()) return;
      if (!googleReady) {
        setSearchError('Google Maps is still loading. Please try again in a moment.');
        return;
      }
      setSearchLoading(true);
      try {
        const result = await geocodeRequest({ address: searchInput.trim() });
        setSearchOptions([]);
        await handleResolvedLocation(result);
      } catch (error) {
        setSearchError(error?.message ?? 'Unable to resolve that address.');
      } finally {
        setSearchLoading(false);
      }
    },
    [geocodeRequest, googleReady, handleResolvedLocation, searchInput]
  );

  const mapStyle = useMemo(
    () => 'mapbox://styles/mapbox/streets-v12',
    []
  );

  const onMarkerClick = useCallback((pin, e) => {
    e.originalEvent.stopPropagation(); // prevent map click
    setPopupInfo(pin);
  }, []);

  useEffect(
    () => () => {
      clearParcelSelection();
    },
    [clearParcelSelection]
  );

  const parcelQueryVariables = useMemo(() => {
    if (!selectedParcelId) return null;
    return {
      first: 1,
      filter: { parcel_id: { eq: selectedParcelId } },
    };
  }, [selectedParcelId]);

  const {
    data: propertyData,
    loading: propertyLoading,
    error: propertyError,
  } = useQuery(GET_REONOMY_PROPERTIES, {
    variables: parcelQueryVariables ?? undefined,
    skip: !parcelQueryVariables,
  });

  const selectedProperty = propertyData?.reonomyProperties?.items?.[0] ?? null;

  const formatNumber = useCallback((value, fractionDigits = 0) => {
    if (value == null) return '—';
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    return numeric.toLocaleString('en-US', { maximumFractionDigits: fractionDigits });
  }, []);

  // Auto-fit to GeoJSON bounds when provided
  useEffect(() => {
    if (!autoFitGeojson) return;
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
  }, [geojson, autoFitGeojson]);

  const metrics = selectedProperty
    ? [
        { label: 'Lot Sq Ft', value: selectedProperty.lot_size_sqft, digits: 0 },
        { label: 'Lot Acres', value: selectedProperty.lot_size_acres, digits: 2 },
        { label: 'Existing FAR', value: selectedProperty.existing_far, digits: 2 },
        { label: 'Existing SF', value: selectedProperty.existing_square_footage, digits: 0 },
        { label: 'Max Floor Plate', value: selectedProperty.max_floor_plate, digits: 0 },
        { label: 'Floors', value: selectedProperty.floors, digits: 0 },
        { label: 'Total Units', value: selectedProperty.total_units, digits: 0 },
        { label: 'Residential Units', value: selectedProperty.residential_units, digits: 0 },
        { label: 'Commercial Units', value: selectedProperty.commercial_units, digits: 0 },
        { label: 'Year Built', value: selectedProperty.year_built, digits: 0 },
        { label: 'Year Renovated', value: selectedProperty.year_renovated, digits: 0 },
      ]
    : [];

  const addressLine1 = selectedProperty?.address_line1 || selectedProperty?.street || null;
  const cityLike = selectedProperty?.city || selectedProperty?.municipality || null;
  const locationLineParts = [cityLike, selectedProperty?.state, selectedProperty?.zip5].filter(Boolean);
  const locationLine = locationLineParts.length ? locationLineParts.join(', ') : null;
  const assetSummaryParts = [selectedProperty?.asset_category, selectedProperty?.asset_type].filter(Boolean);
  const assetSummary = assetSummaryParts.length ? assetSummaryParts.join(' · ') : null;
  const zoningParts = selectedProperty
    ? [selectedProperty.zoning, selectedProperty.zoning_district_1, selectedProperty.zoning_district_2].filter(
        (part, index, array) => {
          if (!part) return false;
          return array.indexOf(part) === index;
        }
      )
    : [];
  const zoningLine = zoningParts.length ? zoningParts.join(' · ') : null;
  const overlayParts = selectedProperty
    ? [selectedProperty.commercial_overlay_1, selectedProperty.commercial_overlay_2].filter(Boolean)
    : [];

  useEffect(() => {
    if (!shouldOpenStreetView || !selectedParcelId) return;
    let lat = null;
    let lng = null;
    let address = null;

    if (lastResolvedLocation) {
      lat = lastResolvedLocation.lat;
      lng = lastResolvedLocation.lng;
      address = lastResolvedLocation.address;
    } else if (selectedProperty) {
      const candidateLat = Number(selectedProperty.lat ?? selectedProperty.latitude);
      const candidateLng = Number(selectedProperty.lon ?? selectedProperty.longitude);
      if (Number.isFinite(candidateLat) && Number.isFinite(candidateLng)) {
        lat = candidateLat;
        lng = candidateLng;
        address = addressLine1 ?? selectedProperty.PropertyAddressFull ?? null;
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    setStreetViewLocation({ lat, lng });
    setStreetViewAddress(address ?? locationLine ?? '');
    setStreetViewOpen(true);
    setShouldOpenStreetView(false);
  }, [addressLine1, lastResolvedLocation, locationLine, selectedParcelId, selectedProperty, shouldOpenStreetView]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSearchSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        <Autocomplete
          options={searchOptions}
          freeSolo
          value={null}
          inputValue={searchInput}
          onInputChange={handleInputChange}
          onChange={handleSearchSelection}
          loading={searchLoading || parcelLookupLoading}
          filterOptions={(options) => options}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label ?? '')}
          isOptionEqualToValue={(option, value) =>
            (typeof option === 'string' ? option : option.label) ===
            (typeof value === 'string' ? value : value.label)
          }
          ListboxProps={{ style: { maxHeight: 240 } }}
          noOptionsText={googleReady ? 'No suggestions' : 'Loading Google Maps…'}
          disabled={!googleMapsApiKey}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search by address"
              placeholder="Start typing an address"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {(searchLoading || parcelLookupLoading) && (
                      <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          flex: 1,
          minHeight: 400,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minHeight: { xs: 360, md: 400 },
            borderRadius: 2,
            overflow: 'hidden',
          }}
          data-selected-parcel={selectedParcelId ?? undefined}
        >
        <Map
          ref={mapRef}
          initialViewState={initialView}
          mapStyle={mapStyle}
          mapboxAccessToken={token}
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            setPopupInfo(null);
            const map = mapRef.current?.getMap?.() ?? mapRef.current;
            const features = e.features || [];

            const assessorFeature = features.find((f) => f?.layer?.id === 'assessor-circles');
            if (assessorFeature && map) {
              const hit = map
                ?.queryRenderedFeatures(e.point, { layers: ['parcel-fills', 'parcel-lines'] })
                ?.[0];
              const hitId = getFeatureId(hit);
              if (hitId) {
                selectParcelById(hitId);
              }
              return;
            }

            const parcelFeature = features.find(
              (f) => f?.layer?.id === 'parcel-fills' || f?.layer?.id === 'parcel-lines'
            );
            const parcelId = getFeatureId(parcelFeature);
            if (parcelId) {
              selectParcelById(parcelId);
              return;
            }

            selectParcelById(null);
          }}
          interactiveLayerIds={['parcel-fills', 'parcel-lines', ...(geojson ? ['assessor-circles'] : [])]}
          onMouseMove={(e) => {
            const map = mapRef.current?.getMap?.() ?? mapRef.current;
            if (!map) return;

            let featuresUnderCursor = e.features || [];
            if (!featuresUnderCursor.length) {
              featuresUnderCursor = map.queryRenderedFeatures(e.point, {
                layers: ['parcel-fills', 'parcel-lines', 'assessor-circles'],
              });
            }

            const parcelFeature = featuresUnderCursor.find(
              (f) => f?.layer?.id === 'parcel-fills' || f?.layer?.id === 'parcel-lines'
            );
            let nextId = getFeatureId(parcelFeature);
            if (!nextId) {
              const fallbackHit = map.queryRenderedFeatures(e.point, {
                layers: ['parcel-fills', 'parcel-lines'],
              })?.[0];
              nextId = getFeatureId(fallbackHit);
            }

            if (hoveredParcelIdRef.current !== nextId) {
              if (hoveredParcelIdRef.current != null) {
                try {
                  map.setFeatureState(
                    { source: 'parcels', sourceLayer: 'attom-parcels', id: hoveredParcelIdRef.current },
                    { hover: false }
                  );
                } catch {}
              }
              if (nextId != null) {
                try {
                  map.setFeatureState(
                    { source: 'parcels', sourceLayer: 'attom-parcels', id: nextId },
                    { hover: true }
                  );
                } catch {}
              }
              hoveredParcelIdRef.current = nextId ?? null;
              setHoveredParcelId(nextId ?? null);
            }

            const pointFeature = featuresUnderCursor.find((f) => f?.layer?.id === 'assessor-circles');
            if (pointFeature) {
              setHoverInfo({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
                properties: pointFeature.properties || {},
              });
            } else if (hoverInfo) {
              setHoverInfo(null);
            }

            try {
              const canvas = map?.getCanvas?.();
              if (canvas?.style) {
                canvas.style.cursor = nextId ? 'pointer' : '';
              }
            } catch {}
          }}
          onMouseLeave={() => {
            const map = mapRef.current?.getMap?.() ?? mapRef.current;
            if (map && hoveredParcelIdRef.current != null) {
              try {
                map.setFeatureState(
                  { source: 'parcels', sourceLayer: 'attom-parcels', id: hoveredParcelIdRef.current },
                  { hover: false }
                );
              } catch {}
            }
            hoveredParcelIdRef.current = null;
            setHoveredParcelId(null);
            setHoverGeom(null);
            setHoverInfo(null);
            try {
              const canvas = map?.getCanvas?.();
              if (canvas?.style) {
                canvas.style.cursor = '';
              }
            } catch {}
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

        {/* Parcels vector source (Mapbox tileset) */}
        <Source 
          id="parcels" 
          type="vector" 
          url="mapbox://svayser.parcel-boundaries"
          promoteId={{ 'attom-parcels': 'ID' }}
        />  

        {/* Parcels fill (underlay) */}
        <Layer
          id="parcel-fills"
          type="fill"
          source="parcels"
          source-layer="attom-parcels"
          paint={{
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#2196f3',
              ['boolean', ['feature-state', 'hover'], false], '#64b5f6',
              'rgba(0, 0, 0, 0)'
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 0.4,
              ['boolean', ['feature-state', 'hover'], false], 0.3,
              0
            ],
          }}
        />

        {/* Parcels outline (overlay) */}
        <Layer
          id="parcel-lines"
          type="line"
          source="parcels"
          source-layer="attom-parcels"
          paint={{
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], '#1976d2',
              ['boolean', ['feature-state', 'hover'], false], '#42a5f5',
              '#90caf9'
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 3,
              ['boolean', ['feature-state', 'hover'], false], 2,
              1
            ],
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 1,
              ['boolean', ['feature-state', 'hover'], false], 0.8,
              0.4
            ]
          }}
        />

        {/* Explicit highlight by filter (robust) */}
        {(() => {
  const highlightId = hoveredParcelId ?? selectedParcelId ?? null;

  const idFilter = highlightId != null
    ? ['==',
        ['to-string', ['id']],
        ['to-string', ['literal', String(highlightId)]]
      ]
    : ['==', ['to-string', ['id']], ''];

  return (
    <>
      <Layer
        id="parcel-highlight-fill"
        type="fill"
        source="parcels"
        source-layer="attom-parcels"
        filter={idFilter}
        paint={{
          'fill-color': selectedParcelId === highlightId ? '#1976d2' : '#42a5f5',
          'fill-opacity': 0.3
        }}
      />
      <Layer
        id="parcel-highlight-line"
        type="line"
        source="parcels"
        source-layer="attom-parcels"
        filter={idFilter}
        paint={{
          'line-color': selectedParcelId === highlightId ? '#1976d2' : '#42a5f5',
          'line-width': 3,
          'line-opacity': 0.8
        }}
      />
    </>
  );
})()}

        {/* Geometry fallback highlight (if vector id mapping fails) */}
        {hoverGeom && (
          <Source id="parcel-hover-geojson" type="geojson" data={{ type: 'FeatureCollection', features: [hoverGeom] }}>
            <Layer id="parcel-hover-geojson-fill" type="fill" paint={{ 'fill-color': '#ff00ff', 'fill-opacity': 0.15 }} />
            <Layer id="parcel-hover-geojson-line" type="line" paint={{ 'line-color': '#ff00ff', 'line-width': 3 }} />
          </Source>
        )}

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
      <Box
        sx={{
          width: { xs: '100%', md: 360 },
          flexShrink: 0,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2,
          maxHeight: { xs: 'auto', md: '100%' },
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Parcel Details
        </Typography>
        {selectedParcelId ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Parcel ID: {selectedParcelId}
            </Typography>

            {(propertyLoading || parcelLookupLoading) && (
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                Loading data…
              </Typography>
            )}

            {propertyError && (
              <Typography variant="body2" sx={{ mt: 2 }} color="error">
                Unable to load property details: {propertyError.message}
              </Typography>
            )}

            {!propertyLoading && !propertyError && !selectedProperty && (
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                No Reonomy data found for this parcel.
              </Typography>
            )}

            {selectedProperty && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box>
                  {addressLine1 && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {addressLine1}
                    </Typography>
                  )}
                  {locationLine && (
                    <Typography variant="body2" color="text.secondary">
                      {locationLine}
                    </Typography>
                  )}
                  {assetSummary && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {assetSummary}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 1.5,
                  }}
                >
                  {metrics.map((metric) => (
                    <Box
                      key={metric.label}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600 }}
                      >
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatNumber(metric.value, metric.digits)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600 }}
                  >
                    Zoning
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {zoningLine ?? '—'}
                  </Typography>
                  {overlayParts.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Overlays: {overlayParts.join(', ')}
                    </Typography>
                  )}
                  {selectedProperty.special_purpose_district && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Special District: {selectedProperty.special_purpose_district}
                    </Typography>
                  )}
                  {selectedProperty.historic_district && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Historic District: {selectedProperty.historic_district}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click a parcel to view building and lot details.
          </Typography>
        )}
      </Box>
      </Box>

      <Dialog
        open={streetViewOpen}
        onClose={() => setStreetViewOpen(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby="street-view-dialog-title"
      >
        <DialogTitle id="street-view-dialog-title">{streetViewAddress || 'Street View'}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {streetViewLocation && googleMapsApiKey ? (
            <Box
              component="iframe"
              src={`https://www.google.com/maps/embed/v1/streetview?key=${googleMapsApiKey}&location=${streetViewLocation.lat},${streetViewLocation.lng}&fov=80`}
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Street View is unavailable for this location.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
