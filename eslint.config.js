/**
 * ESLint-konfigurasjon for Snømåkingsanalysator
 * 
 * ESLint er en linter som analyserer koden for feil og stilmønstre.
 * Den hjelper med å:
 * - Fange feil tidlig
 * - Holde koden konsistent
 * - Følge beste praksis
 * 
 * Denne filen bruker ESLint 9.x "flat config" format.
 * @see https://eslint.org/ - ESLint-dokumentasjon
 * @see https://eslint.org/docs/latest/ - Latest regler
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Hovedkonfigurasjonen
 * 
 * defineConfig er en hjelperfunksjon som gir bedre TypeScript-støtte
 * og autokompletering i IDE-er.
 */
export default defineConfig([
  /**
   * Globale ignores
   * 
   * Filer som aldri skal linters:
   * - dist/: Produksjons-bygget (genereres automatisk)
   */
  globalIgnores(['dist']),
  
  /**
   * TypeScript og React-filer
   * 
   * Alle .ts og .tsx filer får disse reglene:
   */
  {
    // Filer som denne konfigurasjonen gjelder for
    files: ['**/*.{ts,tsx}'],
    
    /**
     * Extends: Beste praksis-regler
     * 
     * Disse er ferdiglagde regelsett som anbefales av:
     * - js.configs.recommended - Grunnleggende JS-regler fra ESLint
     * - tseslint.configs.recommended - TypeScript-regler fra typescript-eslint
     * - reactHooks.configs.recommended - React hooks-regler
     * - reactRefresh.configs.vite - Vite-spesifikke React-refresh regler
     * 
     * @see https://typescript-eslint.io/trules/ - Tilgjengelige TS-regler
     * @see https://github.com/facebook/react - React docs
     */
    extends: [
      js.configs.recommended,                    // Grunnleggende JS-regler
      ...tseslint.configs.recommended,           // TypeScript-regler
      reactHooks.configs.recommended,            // React hooks-regler
      reactRefresh.configs.vite,                  // Vite + React refresh
    ],
    
    /**
     * Plugins: Ekstra regler
     * 
     * Plugins legger til egendefinerte regler:
     * - react-hooks: Sjekker at React hooks brukes riktig
     * - react-refresh: Sjekker at komponenter er kompatible med HMR
     */
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    
    /**
     * Language options
     * 
     * Konfigurerer parser og globals for filene:
     * - ecmaVersion: 2020 - Moderne JS-funksjoner
     * - globals: Tilgang til browser-globals (window, document, etc.)
     */
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    
    /**
     * Rules: Egendefinerte regler
     * 
     * Overstyrer eller legger til regler:
     * 
     * react-hooks/exhaustive-deps:
     * - Krever at alle useEffect-dependencies er listet
     * - 'warn' istedenfor 'error' fordi det ikke er kritisk
     * 
     * react-refresh/only-export-components:
     * - Varsler hvis en komponent eksporterer andre verdier
     * - 'warn' istedenfor 'error' 
     * - allowConstantExport: Tillater å eksportere konstanter
     */
    rules: {
      // Bruk alle anbefalte react-hooks regler
      ...reactHooks.configs.recommended.rules,
      
      // Tillat kun eksportering av komponenter og konstanter
      'react-refresh/only-export-components': [
        'warn', // Varsling istedenfor feil
        { allowConstantExport: true },
      ],
    },
  },
])
