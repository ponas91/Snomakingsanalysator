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
}

export interface SnowEntry {
  id: string;
  timestamp: string;
  snowDepth?: number;
  comment?: string;
  contractor?: string;
}

export interface Contractor {
  name: string;
  phone: string;
  email?: string;
}

export interface HourlyForecast {
  time: string;
  snow: number;
  temperature: number;
  precipitation: number;
}

export interface WeatherData {
  updatedAt: string;
  current: {
    temperature: number;
    snow: number;
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
      details: {
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
  contractor: Contractor | null;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_WEATHER'; payload: WeatherData }
  | { type: 'SET_HISTORY'; payload: SnowEntry[] }
  | { type: 'ADD_HISTORY'; payload: SnowEntry }
  | { type: 'DELETE_HISTORY'; payload: string }
  | { type: 'SET_CONTRACTOR'; payload: Contractor | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
