export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '5',
    addressdetails: '1',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: {
        'User-Agent': 'Snomakingsanalysator/1.0',
        'Accept-Language': 'no,en',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data.map((item: any) => ({
      name: item.name || item.display_name?.split(',')[0] || 'Ukjent',
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}
