export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export interface Settings {
  location: Location;
  snowThreshold: number;
  notifyNight: boolean;
  notifyDay: boolean;
  notifyEnabled: boolean;
  notifyOnSnow: boolean;
}

export interface SnowEntry {
  id: string;
  timestamp: string;
  snowDepth?: number;
  comment?: string;
  contractor?: string;
}

export interface Contractor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

export type PrecipitationType = 'snow' | 'sleet' | 'rain';

export interface HourlyForecast {
  time: string;
  snow: number;
  precipitationType: PrecipitationType;
  temperature: number;
  precipitation: number;
  weatherCondition: string;
}

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

export interface MetNoResponse {
  properties: {
    timeseries: MetNoTimeseries[];
  };
}

export type SnowStatus = 'normal' | 'warning' | 'critical';

export interface AppState {
  settings: Settings;
  weather: WeatherData | null;
  history: SnowEntry[];
  contractors: Contractor[];
  loading: boolean;
  error: string | null;
  lastNotifiedSnow: string | null;
}

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
