'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';

export const GET_TAX_ASSESSORS = gql`
  query {
    attomTaxAssessors {
      items {
        PropertyAddressFull
        PropertyLatitude
        PropertyLongitude
        ATTOM_ID
        parcel_id
      }
    }
  }
`;

export default function TaxAssessors({ onData, renderList = true }) {
  const { loading, error, data } = useQuery(GET_TAX_ASSESSORS);

  // Convert to GeoJSON and notify parent when data changes
  useEffect(() => {
    if (!data || !onData) return;
    const items = data?.attomTaxAssessors?.items ?? [];
    const features = items
      .map((p) => {
        const lat = typeof p.PropertyLatitude === 'number' ? p.PropertyLatitude : parseFloat(p.PropertyLatitude);
        const lng = typeof p.PropertyLongitude === 'number' ? p.PropertyLongitude : parseFloat(p.PropertyLongitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          type: 'Feature',
          id: p.ATTOM_ID ?? p.parcel_id ?? p.PropertyAddressFull,
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { address: p.PropertyAddressFull, parcel_id: p.parcel_id },
        };
      })
      .filter(Boolean);
    const geojson = features.length ? { type: 'FeatureCollection', features } : null;
    onData({ items, geojson, loading: false, error: null });
  }, [data, onData]);

  if (!renderList) return null;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.attomTaxAssessors.items.map((property) => (
        <div key={property.ATTOM_ID ?? property.parcel_id}>
          <h3>{property.PropertyAddressFull}</h3>
          <p>Parcel ID: {property.parcel_id}</p>
          <p>
            Lat: {property.PropertyLatitude}, Lng: {property.PropertyLongitude}
          </p>
        </div>
      ))}
    </div>
  );
}
