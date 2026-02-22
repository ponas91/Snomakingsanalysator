// =============================================================================
// INTERFACES
// =============================================================================

/**
 * GeocodingResult: Resultat fra stedsøk
 * 
 * @property name - Kort navn (f.eks. "Oslo")
 * @property lat - Breddegrad
 * @property lon - Lengdegrad
 * @property display_name - Full adresse
 */
export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
}

/**
 * NominatimPlace: Intern type for API-respons
 */
interface NominatimPlace {
  name: string | null;
  lat: string;
  lon: string;
  display_name: string;
}

// =============================================================================
// KONSTANTER
// =============================================================================

/**
 * NOMINATIM_BASE_URL: OpenStreetMap Nominatim API endepunkt
 * 
 * @see https://nominatim.openstreetmap.org
 */
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// =============================================================================
// VALIDERING
// =============================================================================

/**
 * isValidLatitude: Sjekk om breddegrad er gyldig
 * 
 * @param lat - Breddegrad (-90 til 90)
 * @returns true hvis gyldig
 */
function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * isValidLongitude: Sjekk om lengdegrad er gyldig
 * 
 * @param lon - Lengdegrad (-180 til 180)
 * @returns true hvis gyldig
 */
function isValidLongitude(lon: number): boolean {
  return typeof lon === 'number' && !isNaN(lon) && lon >= -180 && lon <= 180;
}

/**
 * isValidCoordinate: Sjekk om koordinater er gyldige
 * 
 * @param lat - Breddegrad
 * @param lon - Lengdegrad
 * @returns true hvis begge er gyldige
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lon);
}

// =============================================================================
// FUNKSJONER
// =============================================================================

/**
 * searchPlaces: Søk etter steder
 * 
 * Tar et søkeord og returnerer opp til 5 matchende steder
 * med koordinater.
 * 
 * @param query - Søkeord (f.eks. "Oslo", "Bergen")
 * @returns Array med steder og koordinater
 * 
 * @example
 * const resultater = await searchPlaces("Oslo");
 * // [{ name: "Oslo", lat: 59.91, lon: 10.75, display_name: "Oslo, Norge" }]
 */
export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  // Validér input: minst 2 tegn
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Bygg query parameters
  const params = new URLSearchParams({
    q: query.trim(),                    // Søkeord
    format: 'json',                     // JSON respons
    limit: '5',                         // Maks 5 resultater
    addressdetails: '1',                // Inkluder adressedetaljer
  });

  try {
    /**
     * Fetch med riktige headers
     * 
     * User-Agent: Påkrevd av Nominatim
     * Accept-Language: Norsk preferanse, engelsk fallback
     */
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: {
        'User-Agent': 'Snoklar/1.0',
        'Accept-Language': 'no,en',
      },
    });

    // Sjekk for feil
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Parse JSON
    const data = await response.json();

    // Konverter til appens format
    return data.map((item: NominatimPlace) => ({
      // Bruk name hvis tilgjengelig, ellers første del av display_name
      name: item.name || item.display_name?.split(',')[0] || 'Ukjent',
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    // Returner tom liste ved feil (unngå å krasje appen)
    return [];
  }
}

/**
 * reverseGeocode: Koordinater → Stedsnavn (ikke implementert)
 * 
 * For fremtidig bruk: Gitt koordinater, finn stedsnavn.
 * 
 * @param lat - Breddegrad
 * @param lon - Lengdegrad
 * @returns Stedsnavn eller null
 * 
 * @example
 * const sted = await reverseGeocode(59.9139, 10.7522);
 * // "Oslo, Norge"
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  // Validér koordinater før API-kall
  if (!isValidCoordinate(lat, lon)) {
    return null;
  }
  
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Snoklar/1.0',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.display_name;
  } catch {
    return null;
  }
}
