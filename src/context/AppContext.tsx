import React, { createContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Settings, SnowEntry, Contractor, WeatherData } from '../types';
import { fetchWeatherData, calculateSnowInPeriod } from '../services/metno';
import { showNotification, isDayTime, isNightTime } from '../services/notifications';
import { getFromLocalStorage, setToLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEYS = {
  SETTINGS: 'snomaking_settings',
  HISTORY: 'snomaking_history',
  CONTRACTORS: 'snomaking_contractors',
  WEATHER: 'snomaking_weather',
};

const DEFAULT_SETTINGS: Settings = {
  location: {
    name: 'Oslo',
    lat: 59.9139,
    lon: 10.7522,
  },
  snowThreshold: 10,
  notifyNight: true,
  notifyDay: true,
  notifyEnabled: true,
  notifyOnSnow: false,
};

function cleanOldHistory(entries: SnowEntry[]): SnowEntry[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return entries.filter(entry => new Date(entry.timestamp) >= sixMonthsAgo);
}

const initialState: AppState = {
  settings: DEFAULT_SETTINGS,
  weather: null,
  history: [],
  contractors: [],
  loading: false,
  error: null,
  lastNotifiedSnow: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      setToLocalStorage(STORAGE_KEYS.SETTINGS, action.payload);
      return { ...state, settings: action.payload };
    case 'SET_WEATHER':
      setToLocalStorage(STORAGE_KEYS.WEATHER, action.payload);
      return { ...state, weather: action.payload };
    case 'SET_HISTORY':
      setToLocalStorage(STORAGE_KEYS.HISTORY, action.payload);
      return { ...state, history: action.payload };
    case 'ADD_HISTORY': {
      const newHistory = cleanOldHistory([...state.history, action.payload]);
      setToLocalStorage(STORAGE_KEYS.HISTORY, newHistory);
      return { ...state, history: newHistory };
    }
    case 'DELETE_HISTORY': {
      const newHistory = state.history.filter(e => e.id !== action.payload);
      setToLocalStorage(STORAGE_KEYS.HISTORY, newHistory);
      return { ...state, history: newHistory };
    }
    case 'SET_CONTRACTORS':
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, action.payload);
      return { ...state, contractors: action.payload };
    case 'ADD_CONTRACTOR': {
      const newContractors = [...state.contractors, action.payload];
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    case 'UPDATE_CONTRACTOR': {
      const newContractors = state.contractors.map(c =>
        c.id === action.payload.id ? action.payload : c
      );
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    case 'DELETE_CONTRACTOR': {
      const newContractors = state.contractors.filter(c => c.id !== action.payload);
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    case 'SET_CONTRACTOR_PRIMARY': {
      const newContractors = state.contractors.map(c => ({
        ...c,
        isPrimary: c.id === action.payload,
      }));
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LAST_NOTIFIED_SNOW':
      return { ...state, lastNotifiedSnow: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshWeather: () => Promise<void>;
  getSnowStatus: () => { status: 'normal' | 'warning' | 'critical'; snowAmount: number };
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const locationRef = useRef(state.settings.location);
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    locationRef.current = state.settings.location;
  }, [state.settings.location]);

  useEffect(() => {
    const savedSettings = getFromLocalStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    dispatch({ type: 'SET_SETTINGS', payload: savedSettings });

    const savedHistory = getFromLocalStorage<SnowEntry[]>(STORAGE_KEYS.HISTORY, []);
    dispatch({ type: 'SET_HISTORY', payload: cleanOldHistory(savedHistory) });

    const savedContractors = getFromLocalStorage<Contractor[]>(STORAGE_KEYS.CONTRACTORS, []);
    dispatch({ type: 'SET_CONTRACTORS', payload: savedContractors });

    const savedWeather = getFromLocalStorage<WeatherData | null>(STORAGE_KEYS.WEATHER, null);
    if (savedWeather) {
      dispatch({ type: 'SET_WEATHER', payload: savedWeather });
    }

    initialLoadComplete.current = true;
  }, []);

  const refreshWeather = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const weather = await fetchWeatherData(locationRef.current.lat, locationRef.current.lon);
      dispatch({ type: 'SET_WEATHER', payload: weather });

      const { settings, lastNotifiedSnow } = state;
      const currentPrecipType = weather.current.precipitationType;
      const now = new Date().toISOString();

      const shouldNotify = () => {
        if (!settings.notifyOnSnow) return false;
        if (isDayTime() && !settings.notifyDay) return false;
        if (isNightTime() && !settings.notifyNight) return false;
        return true;
      };

      if (shouldNotify() && currentPrecipType === 'snow') {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        if (!lastNotifiedSnow || new Date(lastNotifiedSnow) < oneHourAgo) {
          showNotification('🥶 Det snør!', 'Vurder å bestille brøyting.');
          dispatch({ type: 'SET_LAST_NOTIFIED_SNOW', payload: now });
        }
      }

      if (currentPrecipType !== 'snow') {
        dispatch({ type: 'SET_LAST_NOTIFIED_SNOW', payload: null });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Ukjent feil' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    if (!initialLoadComplete.current) return;
    if (state.settings.location.lat && state.settings.location.lon) {
      refreshWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoadComplete.current]);

  useEffect(() => {
    if (!initialLoadComplete.current) return;
    if (state.settings.location.lat && state.settings.location.lon) {
      refreshWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.location.lat, state.settings.location.lon]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshWeather();
    }, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshWeather();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSnowStatus = () => {
    if (!state.weather) {
      return { status: 'normal' as const, snowAmount: 0 };
    }

    const snow24h = calculateSnowInPeriod(state.weather.hourly, 24);
    const threshold = state.settings.snowThreshold;

    if (snow24h >= threshold * 1.5) {
      return { status: 'critical' as const, snowAmount: snow24h };
    } else if (snow24h >= threshold) {
      return { status: 'warning' as const, snowAmount: snow24h };
    }

    return { status: 'normal' as const, snowAmount: snow24h };
  };

  return (
    <AppContext.Provider value={{ state, dispatch, refreshWeather, getSnowStatus }}>
      {children}
    </AppContext.Provider>
  );
}
