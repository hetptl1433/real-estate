import { gql } from '@apollo/client';

export const GET_REONOMY_PROPERTIES = gql`
  query GetReonomyProperties(
    $first: Int = 50,
    $after: String = null,
    $filter: ReonomyPropertyFilterInput,
    $orderBy: ReonomyPropertyOrderByInput = null
  ) {
    reonomyProperties(first: $first, after: $after, filter: $filter, orderBy: $orderBy) {
      items {
        __typename
        property_id
        parcel_id
        row_id
        apn
        assemblage_id
        asset_category
        asset_type
        block_id
        lot_id
        borough_id
        house_nbr
        street
        address_line1
        city
        municipality
        state
        zip5
        zip4
        lat
        lon
        neighborhood_name
        census_tract
        fips
        fips_county
        mcd_name
        msa_name
        mode
        opp_zone
        zoning
        zoning_district_1
        zoning_district_2
        zoning_map_number
        commercial_overlay_1
        commercial_overlay_2
        special_purpose_district
        historic_district
        landmark
        std_land_use_code
        std_land_use_code_description
        lot_size_sqft
        lot_size_acres
        lot_size_frontage_feet
        lot_size_depth_feet
        frontage
        depth
        existing_far
        existing_floor_area_ratio
        existing_square_footage
        max_floor_plate
        sum_buildings_nbr
        sum_building_sqft
        building_area
        building_class
        floors
        total_units
        residential_units
        commercial_units
        residential_usable_area
        commercial_usable_area
        office_usable_area
        retail_usable_area
        storage_usable_area
        factory_usable_area
        garage_usable_area
        year_built
        year_renovated
        split_boundary
        tax_update_time
        master_update_time
        building_update_time
        sale_update_time
        owner_update_time
        shape_update_time
      }
      endCursor
      hasNextPage
    }
  }
`;
