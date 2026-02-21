/**
 * TypeScript-type-definisjoner for Snømåkingsanalysator
 * 
 * Denne filen inneholder alle TypeScript-interfaces og typer
 * som brukes i applikasjonen.
 * 
 * TypeScript gir:
 * - Type-sikkerhet ved kompilering
 * - Autokompletering i IDE
 * - Dokumentasjon av datastruktur
 * 
 * @see https://www.typescriptlang.org/docs/handbook/2/objects.html - Interface dokumentasjon
 * @see https://www.typescriptlang.org/docs/handbook/2/types-from-types.html - Type aliases
 */

// =============================================================================
// LOKASJON
// =============================================================================

/**
 * Location: Geografisk posisjon
 * 
 * Brukes for å lagre og sende lokasjonsdata.
 * 
 * @property name - Visningsnavn (f.eks. "Oslo")
 * @property lat - Breddegrad (latitude)
 * @property lon - Lengdegrad (longitude)
 */
export interface Location {
  name: string;
  lat: number;
  lon: number;
}

// =============================================================================
// INNSTILLINGER
// =============================================================================

/**
 * Settings: Brukerinnstillinger for appen
 * 
 * Inneholder alle konfigurerbare verdier.
 * Lagres i localStorage og Synkroniseres med Supabase ved behov.
 * 
 * @property location - Valgt lokasjon for værdata
 * @property snowThreshold - Minimum snø (mm) før varsling
 * @property notifyNight - Varsle om natten (18:00-09:00)
 * @property notifyDay - Varsle på dagen (09:00-18:00)
 * @property notifyEnabled - Hovedbryter for varsler
 * @property notifyOnSnow - Spesifik varsling når det snør
 */
export interface Settings {
  location: Location;
  snowThreshold: number;
  notifyNight: boolean;
  notifyDay: boolean;
  notifyEnabled: boolean;
  notifyOnSnow: boolean;
}

// =============================================================================
// BRØYTING
// =============================================================================

/**
 * SnowEntry: En oppføring i brøytingsloggen
 * 
 * Representerer én brøyting som er loggført.
 * 
 * @property id - Unik identifikator (UUID)
 * @property timestamp - Når brøytingen skjedde (ISO-8601 format)
 * @property snowDepth - Snødybde i mm (valgfritt)
 * @property comment - Kommentar (valgfritt)
 * @property contractor - Navn på entreprenør (valgfritt)
 */
export interface SnowEntry {
  id: string;
  timestamp: string;
  snowDepth?: number;
  comment?: string;
  contractor?: string;
}

// =============================================================================
// KONTAKTER
// =============================================================================

/**
 * Contractor: Entreprenør / kontakt
 * 
 * En person eller firma som kan utføre brøyting.
 * 
 * @property id - Unik identifikator (UUID)
 * @property name - Navn på entreprenøren
 * @property phone - Telefonnummer (inkluderer landskode)
 * @property email - E-postadresse (valgfritt)
 * @property isPrimary - Er dette hovedkontakten? (valgfritt)
 */
export interface Contractor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

// =============================================================================
// VÆR
// =============================================================================

/**
 * PrecipitationType: Type nedbør
 * 
 * Union type for hva slags nedbør det er.
 * Brukes for å bestemme ikoner og farger.
 */
export type PrecipitationType = 'snow' | 'sleet' | 'rain';

/**
 * HourlyForecast: Time-forvarsling
 * 
 * Værvarsel for én time frem i tid.
 * 
 * @property time - Tidspunkt (ISO-8601)
 * @property snow - Forventet snø i mm
 * @property precipitationType - Type nedbør
 * @property temperature - Temperatur i Celsius
 * @property precipitation - Nedbør i mm
 * @property weatherCondition - Værkode (f.eks. "clearsky", "snow")
 */
export interface HourlyForecast {
  time: string;
  snow: number;
  precipitationType: PrecipitationType;
  temperature: number;
  precipitation: number;
  weatherCondition: string;
}

/**
 * WeatherData: Komplett værdata
 * 
 * Inneholder både nåværende vær og time-forvarsling.
 * 
 * @property updatedAt - Når dataene sist ble oppdatert
 * @property current - Nåværende vær
 * @property hourly - Time-forvarsling (48 timer)
 */
export interface WeatherData {
  updatedAt: string;
  current: {
    temperature: number;
    snow: number;
    precipitationType: PrecipitationType;
    precipitation: number;
    weatherCondition: string;
    windSpeed: number;
  };
  hourly: HourlyForecast[];
}

// =============================================================================
// MET.NO API TYPER
// =============================================================================

/**
 * MetNoTimeseries: Rå format fra Met.no API
 * 
 * Dette er TypeScript-representasjonen av JSON-responsen
 * fra Meteorologisk institutt sin API.
 * 
 * @property time - Tidspunkt for datapunkten
 * @property data - Værinformasjon for dette tidspunktet
 */
export interface MetNoTimeseries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        precipitation_amount?: number;
      };
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
    next_6_hours?: {
      summary?: {
        symbol_code: string;
      };
      details?: {
        precipitation_amount: number;
      };
    };
  };
}

/**
 * MetNoResponse: Rot-objektet fra Met.no API
 * 
 * Wrapper for timeseries-data fra API-et.
 */
export interface MetNoResponse {
  properties: {
    timeseries: MetNoTimeseries[];
  };
}

// =============================================================================
// APP STATUS
// =============================================================================

/**
 * SnowStatus: Snøsituasjon
 * 
 * Union type for ulike nivåer av snø-alarm.
 * Brukes for å vise fargekodet status i UI.
 * 
 * - normal: Ingen umiddelbar handling nødvendig
 * - warning: Vurder å bestille brøyting
 * - critical: Bestill brøyting nå
 */
export type SnowStatus = 'normal' | 'warning' | 'critical';

// =============================================================================
// APP STATE
// =============================================================================

/**
 * AppState: Global tilstand for appen
 * 
 * Dette er typen for hele applikasjonens tilstand.
 * Forvaltes av AppContext og AppReducer.
 * 
 * @property settings - Brukerinnstillinger
 * @property weather - Nåværende værdata
 * @property history - Logg over brøytinger
 * @property contractors - Lagrede kontakter
 * @property loading - Laster appen?
 * @property error - Feilmelding (hvis noe gikk galt)
 * @property lastNotifiedSnow - Timestamp for siste snø-varsel
 */
export interface AppState {
  settings: Settings;
  weather: WeatherData | null;
  history: SnowEntry[];
  contractors: Contractor[];
  loading: boolean;
  error: string | null;
  lastNotifiedSnow: string | null;
}

/**
 * AppAction: Handlinger som kan utføres på app-state
 * 
 * Union type for alle mulige actions i reduceren.
 * Hver action har en type og en payload med data.
 * 
 * @see AppContext - Hvor reduceren implementeres
 */
export type AppAction =
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_WEATHER'; payload: WeatherData }
  | { type: 'SET_HISTORY'; payload: SnowEntry[] }
  | { type: 'ADD_HISTORY'; payload: SnowEntry }
  | { type: 'DELETE_HISTORY'; payload: string }
  | { type: 'SET_CONTRACTORS'; payload: Contractor[] }
  | { type: 'ADD_CONTRACTOR'; payload: Contractor }
  | { type: 'UPDATE_CONTRACTOR'; payload: Contractor }
  | { type: 'DELETE_CONTRACTOR'; payload: string }
  | { type: 'SET_CONTRACTOR_PRIMARY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_NOTIFIED_SNOW'; payload: string | null };
