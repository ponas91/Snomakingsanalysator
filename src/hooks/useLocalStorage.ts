/**
 * useLocalStorage: Hook for localStorage-persistens
 * 
 * Denne hooken abstraherer bort kompleksiteten med å lese
 * og skrive til browserens localStorage.
 * 
 * Den håndterer:
 * - Initiel lasting fra localStorage
 * - Automatisk JSON serialisering/deserialisering
 * - Feilhåndtering hvis localStorage ikke er tilgjengelig
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */

import { useState, useCallback } from 'react';

/**
 * useLocalStorage: Hook for å lese/skjrive til localStorage
 * 
 * Lager en React-state som automatisk synkroniseres med localStorage.
 * 
 * @template T - Type av data som lagres
 * @param key - Nøkkel i localStorage
 * @param initialValue - Standardverdi hvis nøkkelen ikke eksisterer
 * @returns [Verdi, Setter-funksjon]
 * 
 * @example
 * const [navn, setNavn] = useLocalStorage('brukernavn', 'Gjest');
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // useState med lazy initializer:
  // Kjører kun én gang ved komponent-mount
  // Prøver å lese fra localStorage, bruker initial hvis feil
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Prøv å hente fra localStorage
      const item = window.localStorage.getItem(key);
      
      // Returner parsed item eller initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Hvis noe går galt, returner initial value
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * setValue: Setter ny verdi i state og localStorage
   * 
   * Støtter både:
   * - Direkte verdi: setValue('ny verdi')
   * - Funksjon: setValue(prev => prev + 1)
   * 
   * @param value - Ny verdi eller funksjon som beregner ny verdi
   */
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Støtt både verdi og funksjon (som setState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Oppdater React state
      setStoredValue(valueToStore);
      
      // Lagre til localStorage som JSON
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * getFromLocalStorage: Hent verdi fra localStorage (uten hook)
 * 
 * Hjelperfunksjon for engangs-lesing fra localStorage.
 * Brukes f.eks. ved app-initialisering.
 * 
 * @template T - Type av data
 * @param key - Nøkkel i localStorage
 * @param defaultValue - Verdi hvis nøkkelen ikke finnes
 * @returns Lagret verdi eller defaultValue
 * 
 * @example
 * const innstillinger = getFromLocalStorage('settings', defaultSettings);
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * setToLocalStorage: Lagre verdi til localStorage (uten hook)
 * 
 * Hjelperfunksjon for å lagre til localStorage.
 * Brukes av reduceren når state endres.
 * 
 * @template T - Type av data
 * @param key - Nøkkel i localStorage
 * @param value - Verdi som skal lagres
 * 
 * @example
 * setToLocalStorage('history', newHistory);
 */
export function setToLocalStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}
