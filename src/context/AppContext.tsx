/**
 * AppContext: Global state management for Snøklar
 * 
 * Denne filen håndterer all global tilstand i appen:
 * - Innstillinger (location, notifications, etc.)
 * - Værdata (current weather, forecast)
 * - Brøytingshistorikk (log over når det er brøytet)
 * - Kontakter (entreprenører)
 * 
 * Implementerer Redux-lignende mønster med:
 * - createContext: Gir tilgang til state globalt
 * - useReducer: Håndterer state-oppdateringer
 * - useEffect: Håndterer side effects (API-kall, localStorage)
 * 
 * @see https://react.dev/learn/passing-data-deeply-with-context - Context i React
 * @see https://react.dev/reference/react/useReducer - useReducer hook
 */

// =============================================================================
// IMPORTER
// =============================================================================

import React, { createContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Settings, SnowEntry, Contractor, WeatherData } from '../types';

// API-funksjoner for værdata og snøberegning
import { fetchWeatherData, calculateSnowInPeriod } from '../services/metno';

// Notifikasjonsfunksjoner
import { showNotification, isDayTime, isNightTime } from '../services/notifications';

// LocalStorage-hjelpere for data-persistens
import { getFromLocalStorage, setToLocalStorage } from '../hooks/useLocalStorage';

// =============================================================================
// KONSTANTER
// =============================================================================

/**
 * STORAGE_KEYS: Nøkler for localStorage
 * 
 * Disse nøklene brukes for å lagre data i browserens localStorage.
 * Prefix 'snomaking_' unngår konflikter med andre apper.
 * 
 * Data som lagres:
 * - settings: Brukerens innstillinger
 * - history: Brøytingslogg
 * - contractors: Kontakter/entreprenører
 * - weather: Siste værdata (for offline-visning)
 */
const STORAGE_KEYS = {
  SETTINGS: 'snomaking_settings',       // Brukerinnstillinger
  HISTORY: 'snomaking_history',         // Brøytingshistorikk
  CONTRACTORS: 'snomaking_contractors', // Kontakter
  WEATHER: 'snomaking_weather',         // Værdata (cache)
};

/**
 * DEFAULT_SETTINGS: Standard innstillinger
 * 
 * Disse verdiene brukes hvis brukeren ikke har satt egne innstillinger.
 * Oslo er valgt som standard siden appen er norsk.
 */
const DEFAULT_SETTINGS: Settings = {
  location: {
    name: 'Oslo',
    lat: 59.9139,
    lon: 10.7522,
  },
  snowThreshold: 10,      // 10mm snø = varsling
  notifyNight: true,      // Varsle om natten
  notifyDay: true,        // Varsle på dagen
  notifyEnabled: true,    // Hovedbryter for varsler
  notifyOnSnow: false,    // Varsle når det snør
};

// =============================================================================
// HJELPEFUNKSJONER
// =============================================================================

/**
 * cleanOldHistory: Fjerner gamle oppføringer
 * 
 * Brøytingsloggen skal kun vise de siste 6 månedene.
 * Denne funksjonen filtrerer bort eldre oppføringer.
 * 
 * @param entries - Alle brøytingsoppføringer
 * @returns Kun oppføringer fra siste 6 måneder
 */
function cleanOldHistory(entries: SnowEntry[]): SnowEntry[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return entries.filter(entry => new Date(entry.timestamp) >= sixMonthsAgo);
}

// =============================================================================
// INITIAL STATE
// =============================================================================

/**
 * initialState: Startverdier for appen
 * 
 * Disse verdiene brukes når appen starter for første gang.
 * Deretter lastes lagret data fra localStorage.
 */
const initialState: AppState = {
  settings: DEFAULT_SETTINGS,
  weather: null,
  history: [],
  contractors: [],
  loading: false,
  error: null,
  lastNotifiedSnow: null,
};

// =============================================================================
// REDUCER
// =============================================================================

/**
 * appReducer: Håndterer state-oppdateringer
 * 
 * Reduceren tar nåværende state og en action, og returnerer ny state.
 * Dette er samme mønster som Redux.
 * 
 * Hver case:
 * 1. Utfører logikken for den aktuelle handlingen
 * 2. Lagrer endringen til localStorage
 * 3. Returnerer ny state
 * 
 * @param state - Nåværende tilstand
 * @param action - Handling som skal utføres
 * @returns Ny tilstand
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // SETTINGS: Oppdater brukerinnstillinger
    case 'SET_SETTINGS':
      setToLocalStorage(STORAGE_KEYS.SETTINGS, action.payload);
      return { ...state, settings: action.payload };
      
    // SET_WEATHER: Oppdater værdata
    case 'SET_WEATHER':
      setToLocalStorage(STORAGE_KEYS.WEATHER, action.payload);
      return { ...state, weather: action.payload };
      
    // SET_HISTORY: Sett komplett historikk (f.eks. ved lasting)
    case 'SET_HISTORY':
      setToLocalStorage(STORAGE_KEYS.HISTORY, action.payload);
      return { ...state, history: action.payload };
      
    // ADD_HISTORY: Legg til ny brøytingsoppføring
    case 'ADD_HISTORY': {
      const newHistory = cleanOldHistory([...state.history, action.payload]);
      setToLocalStorage(STORAGE_KEYS.HISTORY, newHistory);
      return { ...state, history: newHistory };
    }
    
    // DELETE_HISTORY: Fjern en oppføring
    case 'DELETE_HISTORY': {
      const newHistory = state.history.filter(e => e.id !== action.payload);
      setToLocalStorage(STORAGE_KEYS.HISTORY, newHistory);
      return { ...state, history: newHistory };
    }
    
    // SET_CONTRACTORS: Sett alle kontakter
    case 'SET_CONTRACTORS':
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, action.payload);
      return { ...state, contractors: action.payload };
      
    // ADD_CONTRACTOR: Legg til ny kontakt
    case 'ADD_CONTRACTOR': {
      const newContractors = [...state.contractors, action.payload];
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    
    // UPDATE_CONTRACTOR: Oppdater eksisterende kontakt
    case 'UPDATE_CONTRACTOR': {
      const newContractors = state.contractors.map(c =>
        c.id === action.payload.id ? action.payload : c
      );
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    
    // DELETE_CONTRACTOR: Fjern kontakt
    case 'DELETE_CONTRACTOR': {
      const newContractors = state.contractors.filter(c => c.id !== action.payload);
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    
    // SET_CONTRACTOR_PRIMARY: Sett hovedkontakt
    case 'SET_CONTRACTOR_PRIMARY': {
      const newContractors = state.contractors.map(c => ({
        ...c,
        isPrimary: c.id === action.payload,
      }));
      setToLocalStorage(STORAGE_KEYS.CONTRACTORS, newContractors);
      return { ...state, contractors: newContractors };
    }
    
    // SET_LOADING: Vis/skjul last-indikator
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    // SET_ERROR: Vis feilmelding
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    // SET_LAST_NOTIFIED_SNOW: Oppdater siste varsel-tidspunkt
    case 'SET_LAST_NOTIFIED_SNOW':
      return { ...state, lastNotifiedSnow: action.payload };
      
    // Default: Returner uendret state
    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

/**
 * AppContextType: Type for context-verdien
 * 
 * Definerer hva som er tilgjengelig via useApp() hook.
 */
interface AppContextType {
  state: AppState;                                             // Global tilstand
  dispatch: React.Dispatch<AppAction>;                         // Dispatch funksjon
  refreshWeather: () => Promise<void>;                         // Hent ny værdata
  getSnowStatus: () => { status: 'normal' | 'warning' | 'critical'; snowAmount: number }; // Beregn snøstatus
}

// Opprett context med undefined som standard (må wrap med Provider)
export const AppContext = createContext<AppContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * AppProvider: Wrapper som gir tilgang til global state
 * 
 * Denne komponenten:
 * 1. Initialiserer state fra localStorage
 * 2. Setter opp periodisk oppdatering av værdata
 * 3. Håndterer varslinger
 * 
 * @param children - Komponentene som skal ha tilgang til state
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // useReducer: Returnerer [state, dispatch] tuple
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  /**
   * useRef for verdier som trengs i callbacks
   * 
   * Disse oppdateres kontinuerlig men triggere ikke re-render.
   * Brukes for å unngå stale closures i async funksjoner.
   */
  const locationRef = useRef(state.settings.location);    // Gjeldende lokasjon
  const initialLoadComplete = useRef(false);             // Sjekk om første lasting er ferdig
  
  // Hold locationRef oppdatert når settings endres
  useEffect(() => {
    locationRef.current = state.settings.location;
  }, [state.settings.location]);
  
  /**
   * Initial lasting fra localStorage
   * 
   * Når appen starter:
   * 1. Last inn lagrede innstillinger
   * 2. Last inn historikk (og fjern gamle oppføringer)
   * 3. Last inn kontakter
   * 4. Last inn cached værdata (hvis tilgjengelig)
   */
  useEffect(() => {
    // Last inn lagrede innstillinger
    const savedSettings = getFromLocalStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    dispatch({ type: 'SET_SETTINGS', payload: savedSettings });
    
    // Last inn historikk og fjern gamle oppføringer
    const savedHistory = getFromLocalStorage<SnowEntry[]>(STORAGE_KEYS.HISTORY, []);
    dispatch({ type: 'SET_HISTORY', payload: cleanOldHistory(savedHistory) });
    
    // Last inn kontakter
    const savedContractors = getFromLocalStorage<Contractor[]>(STORAGE_KEYS.CONTRACTORS, []);
    dispatch({ type: 'SET_CONTRACTORS', payload: savedContractors });
    
    // Last inn cached værdata (for offline-støtte)
    const savedWeather = getFromLocalStorage<WeatherData | null>(STORAGE_KEYS.WEATHER, null);
    if (savedWeather) {
      dispatch({ type: 'SET_WEATHER', payload: savedWeather });
    }
    
    // Marker at initial lasting er ferdig
    initialLoadComplete.current = true;
  }, []);
  
  /**
   * refreshWeather: Hent ny værdata fra Met.no API
   * 
   * Denne funksjonen:
   * 1. Setter loading til true
   * 2. Fjerner eventuelle feil
   * 3. Henter værdata for gjeldende lokasjon
   * 4. Sjekker om varsling skal sendes
   * 5. Oppdaterer state med ny data
   * 
   * @throws Error hvis API-kall feiler
   */
  const refreshWeather = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Hent værdata fra Met.no
      const weather = await fetchWeatherData(locationRef.current.lat, locationRef.current.lon);
      dispatch({ type: 'SET_WEATHER', payload: weather });
      
      const { settings, lastNotifiedSnow } = state;
      const currentPrecipType = weather.current.precipitationType;
      const now = new Date().toISOString();
      
      /**
       * shouldNotify: Sjekk om brukeren skal varsles
       * 
       * Vurderer:
       * - Er "varsle ved snø" aktivert?
       * - Er det dagtid og varsling på dag tid aktivert?
       * - Er det natt og varsling på natt aktivert?
       */
      const shouldNotify = () => {
        if (!settings.notifyOnSnow) return false;
        if (isDayTime() && !settings.notifyDay) return false;
        if (isNightTime() && !settings.notifyNight) return false;
        return true;
      };
      
      // Send varsling hvis det snør og brukeren har aktivert varsling
      if (shouldNotify() && currentPrecipType === 'snow') {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        
        // Unngå spam: kun varsle hvis det er mer enn 1 time siden forrige varsel
        if (!lastNotifiedSnow || new Date(lastNotifiedSnow) < oneHourAgo) {
          showNotification('🥶 Det snør!', 'Vurder å bestille brøyting.');
          dispatch({ type: 'SET_LAST_NOTIFIED_SNOW', payload: now });
        }
      }
      
      // Nullstill varsel-timestamp hvis det ikke lenger snør
      if (currentPrecipType !== 'snow') {
        dispatch({ type: 'SET_LAST_NOTIFIED_SNOW', payload: null });
      }
    } catch (error) {
      // Sett feilmelding i state (vises til bruker)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Ukjent feil' });
    } finally {
      // Alltid nullstille loading, uansett om suksess eller feil
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  /**
   * Effect: Hent værdata ved oppstart
   * 
   * Kjører når initialLoadComplete blir sann.
   * Sjekker at lokasjon er satt før kalling.
   */
  useEffect(() => {
    if (!initialLoadComplete.current) return;
    if (state.settings.location.lat && state.settings.location.lon) {
      refreshWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoadComplete.current]);
  
  /**
   * Effect: Hent værdata når lokasjon endres
   * 
   * Kjører når brukeren endrer lokasjon i innstillinger.
   */
  useEffect(() => {
    if (!initialLoadComplete.current) return;
    if (state.settings.location.lat && state.settings.location.lon) {
      refreshWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.location.lat, state.settings.location.lon]);
  
  /**
   * Effect: Periodisk oppdatering
   * 
   * Setter opp interval som refresher værdata hvert 15. minutt.
   * 15 * 60 * 1000 = 900000 ms = 15 minutter
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshWeather();
    }, 15 * 60 * 1000);
    
    // Cleanup: Fjern interval når component unmounts
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /**
   * Effect: Oppdater ved tab-bytte
   * 
   * Når brukeren kommer tilbake til appen (f.eks. fra annen fane),
   * freshes værdata for å sikre at data er oppdatert.
   */
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
  
  /**
   * getSnowStatus: Beregn snøstatus basert på 24t prognose
   * 
   * Sammenligner forventet snømengde med brukerens terskel:
   * - normal: < terskel
   * - warning: >= terskel
   * - critical: >= terskel * 1.5
   * 
   * @returns Status og snømengde
   */
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
  
  // Gjør state og funksjoner tilgjengelig via Context
  return (
    <AppContext.Provider value={{ state, dispatch, refreshWeather, getSnowStatus }}>
      {children}
    </AppContext.Provider>
  );
}
