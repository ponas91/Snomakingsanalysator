/**
 * Main entry point for Snømåkingsanalysator
 * 
 * Denne filen er startpunktet for React-applikasjonen.
 * Den:
 * 1. Importerer React og andre avhengigheter
 * 2. Finner HTML-elementet appen skal mountes til
 * 3. Renderer React-komponenten inn i DOM-en
 * 
 * @see https://react.dev/ - React dokumentasjon
 * @see https://vite.dev/ - Vite dokumentasjon
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * createRoot: Lager en React root for å rendre til DOM
 * 
 * document.getElementById('root'): Finner <div id="root"> i index.html
 * !: TypeScript-assertion som garanterer at elementet eksisterer
 * 
 * Erstatter ReactDOM.render() fra tidligere versjoner av React
 */
createRoot(document.getElementById('root')!).render(
  /**
   * StrictMode: Utviklingsverktøy som hjelper med feil
   * 
   * Den:
   * - Render komponenter to ganger for å finne side effects
   * - Sjekker for utdaterte API-bruk
   * - Varsler om side effects i useEffect
   * 
   * Kun aktiv i utvikling - har ingen effekt i produksjon
   * 
   * @see https://react.dev/reference/react/StrictMode
   */
  <StrictMode>
    <App />
  </StrictMode>,
)
