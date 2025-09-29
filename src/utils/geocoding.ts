// Geocoding utility using Mapbox Geocoding API
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    console.warn("Mapbox token not found, using fallback coordinates");
    return {
      latitude: 19.1248, // Mumbai coordinates as fallback
      longitude: 72.8485,
      formattedAddress: address,
    };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&country=IN&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name || address,
      };
    }

    // Fallback to Mumbai if no results found
    return {
      latitude: 19.1248,
      longitude: 72.8485,
      formattedAddress: address,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    // Fallback to Mumbai coordinates
    return {
      latitude: 19.1248,
      longitude: 72.8485,
      formattedAddress: address,
    };
  }
}

// Reverse geocoding - convert coordinates to address
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
