import { gql } from '@apollo/client';

export const GET_PARCEL_BY_LOCATION = gql`
  query GetParcelByLocation($latitude: Float!, $longitude: Float!) {
    executeGetParcelByLocation(latitude: $latitude, longitude: $longitude) {
      parcel_id: ID
    }
  }
`;
