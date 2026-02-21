import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Settings, SnowEntry, Contractor } from '../types';
import { fetchWeatherData, calculateSnowInPeriod } from '../services/metno';
import { getFromLocalStorage, setToLocalStorage } from '../hooks/useLocalStorage';

const STORAGE_KEYS = {
  SETTINGS: 'snomaking_settings',
  HISTORY: 'snomaking_history',
  CONTRACTORS: 'snomaking_contractors',
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
  contractors: [],
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

  const locationRef = useRef(state.settings.location);

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
  }, []);

  const refreshWeather = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const weather = await fetchWeatherData(locationRef.current.lat, locationRef.current.lon);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshWeather();
    }, 15 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshWeather();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
