/**
 * useApp: Hook for tilgang til global state
 * 
 * Denne hooken gir enkel tilgang til all global tilstand i appen.
 * Den er wrapperen rundt React Context og kaster feil hvis den
 * brukes utenfor AppProvider.
 * 
 * BRUK:
 * const { state, dispatch, refreshWeather, getSnowStatus } = useApp();
 * 
 * @returns {Object} Med state, dispatch, refreshWeather, getSnowStatus
 * @throws Error hvis brukt utenfor AppProvider
 * 
 * @see AppContext - Context-definisjonen
 * @see AppProvider - Provider-komponenten
 */

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * useApp: Custom hook for tilgang til global state
 * 
 * Hooken:
 * 1. Bruker useContext for å hente verdien fra AppContext
 * 2. Sjekker at context ikke er undefined (betyr AppProvider mangler)
 * 3. Returnerer hele context-objektet
 * 
 * @returns {AppContextType} Global state og funksjoner
 * @throws {Error} Hvis hooken brukes utenfor AppProvider
 */
export function useApp() {
  // useContext: Henter verdi fra nærmeste AppContext.Provider
  const context = useContext(AppContext);
  
  // Sjekk: Kaster feil hvis context er undefined
  // Dette betyr at hooken ble kalt utenfor AppProvider
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  // Returner hele context-objektet
  // Inneholder: state, dispatch, refreshWeather, getSnowStatus
  return context;
}
