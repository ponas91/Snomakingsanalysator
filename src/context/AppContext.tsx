import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Settings, SnowEntry, Contractor } from '../types';
import { fetchWeatherData, calculateSnowInPeriod } from '../services/metno';
import { getFromLocalStorage, setToLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEYS = {
  SETTINGS: 'snomaking_settings',
  HISTORY: 'snomaking_history',
  CONTRACTOR: 'snomaking_contractor',
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
  contractor: null,
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      setToLocalStorage(STORAGE_KEYS.SETTINGS, action.payload);
      return { ...state, settings: action.payload };
    case 'SET_WEATHER':
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
    case 'SET_CONTRACTOR':
      setToLocalStorage(STORAGE_KEYS.CONTRACTOR, action.payload);
      return { ...state, contractor: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedSettings = getFromLocalStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    dispatch({ type: 'SET_SETTINGS', payload: savedSettings });

    const savedHistory = getFromLocalStorage<SnowEntry[]>(STORAGE_KEYS.HISTORY, []);
    dispatch({ type: 'SET_HISTORY', payload: cleanOldHistory(savedHistory) });

    const savedContractor = getFromLocalStorage<Contractor | null>(STORAGE_KEYS.CONTRACTOR, null);
    dispatch({ type: 'SET_CONTRACTOR', payload: savedContractor });
  }, []);

  const refreshWeather = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const weather = await fetchWeatherData(state.settings.location.lat, state.settings.location.lon);
      dispatch({ type: 'SET_WEATHER', payload: weather });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Ukjent feil' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    if (state.settings.location.lat && state.settings.location.lon) {
      refreshWeather();
    }
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

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
