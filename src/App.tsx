/**
 * Hovedapplikasjonen for Snøklar
 * 
 * Denne filen inneholder:
 * - App(): Root-komponent som setter opp provider
 * - AppContent(): Hovedkomponent med navigasjon og layout
 * 
 * Navigasjon:
 * - Hjem (home): Vær, snøstatus, prognose
 * - Historikk (history): Logg over brøytinger
 * - Kontakt (contractor): Entreprenører
 * - Innstillinger (settings): App-innstillinger
 * 
 * @see AppProvider - Global state i context/AppContext.tsx
 */

import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { VERSION, BUILD_DATE } from './lib/version';
import { WeatherCard } from './components/WeatherCard';
import { ForecastChart } from './components/ForecastChart';
import { SnowStatusCard } from './components/SnowStatusCard';
import { HistoryTable } from './components/HistoryTable';
import { SettingsForm } from './components/SettingsForm';
import { ContractorCard } from './components/ContractorCard';
import { usePWAAutoUpdate, PWAUpdateNotification } from './components/PWAUpdate';

/**
 * Tab-typer for navigasjon
 * 
 * Definerer alle tilgjengelige faner i appen.
 * Hver verdi matcher med navigation-logikken.
 */
type Tab = 'home' | 'history' | 'settings' | 'contractor';

/**
 * AppContent: Hovedkomponent med all UI-logikk
 * 
 * Denne komponenten:
 * - Viser header med lokasjon
 * - Viser aktiv tab sin innhold
 * - Viser bottom navigation
 * - Viser footer med kreditert
 * 
 * Bruker useApp hook for å få tilgang til global state.
 * @see useApp
 */
function AppContent() {
  // Aktivt fan-valg (state)
  const [activeTab, setActiveTab] = useState<Tab>('home');
  
  // PWA oppdaterings-håndtering
  const { updateAvailable, updateApp } = usePWAAutoUpdate();

  // Lenke til Met.no for værdata-kreditering
  const metUrl = `https://www.met.no/`;

  /**
   * Tab-konfigurasjon
   * 
   * Definerer alle faner med:
   * - id: Unik identifikator (matches Tab-typen)
   * - label: Tekst som vises i navigation
   * - icon: Emoji som vises i navigation
   */
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: 'Hjem', icon: '🏠' },
    { id: 'history', label: 'Historikk', icon: '📋' },
    { id: 'contractor', label: 'Kontakt', icon: '📞' },
    { id: 'settings', label: 'Innstillinger', icon: '⚙️' },
  ];

  return (
    /**
     * Hovedcontainer
     * 
     * min-h-screen: Minst 100% av viewport-høyde
     * bg-slate-900: Mørk bakgrunnsfarge
     * pb-20: Padding bottom for å gi plass til navigation
     */
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* =====================
       * PWA Oppdaterings-varsel
       * =====================
       * Vises når ny versjon er tilgjengelig
       * @see PWAUpdate.tsx
       */}
      <PWAUpdateNotification updateAvailable={updateAvailable} onUpdate={updateApp} />
      
      {/**
       * Header
       * 
       * Viser:
       * - App-tittel
       * - Kreditering til Met.no
       */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-md z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* App-tittel */}
          <h1 className="text-2xl font-extrabold text-white">❄️ Snøklar</h1>
          
          {/* Kreditering til Met.no */}
          <a 
            href={metUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-400 mt-2"
          >
            Data: Meteorologisk institutt (Met.no) →
          </a>
        </div>
      </header>

      {/**
       * Main content area
       * 
       * Viser innhold basert på aktiv tab.
       * max-w-2xl: Maksimal bredde for lesbarhet
       * space-y-4: Mellomrom mellom komponenter
       */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 flex-1 overflow-hidden">
        {activeTab === 'home' && (
          <>
            {/* Hjem-fane: Vær, snøstatus, prognose */}
            <WeatherCard />
            <SnowStatusCard />
            <ForecastChart />
          </>
        )}

        {activeTab === 'history' && <HistoryTable />}

        {activeTab === 'contractor' && <ContractorCard />}

        {activeTab === 'settings' && <SettingsForm />}
      </main>

      {/**
       * Bottom Navigation
       * 
       * Fast navigasjonsrad nederst på skjermen.
       * Viser alle 4 faner med icon og label.
       * Styling indikerer aktiv fane.
       */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-sky-400 bg-slate-800'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/**
       * Footer
       * 
       * Kreditering til utvikler.
       * Padding bottom (pb-24) for å unngå å dekke navigasjonen.
       */}
      <footer className="pb-24 pt-4 text-center">
        <a 
          href="https://duvsethe.it" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-sky-400 transition-colors"
        >
          v{VERSION} ({BUILD_DATE}) | Utviklet av Duvsethe IT
        </a>
      </footer>
    </div>
  );
}

/**
 * App: Root-komponent
 * 
 * Wrapper AppContent med:
 * - AppProvider: Gir tilgang til global state
 * 
 * @see AppContext - Global state management
 */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
