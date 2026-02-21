import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WeatherCard } from './components/WeatherCard';
import { ForecastChart } from './components/ForecastChart';
import { SnowStatusCard } from './components/SnowStatusCard';
import { HistoryTable } from './components/HistoryTable';
import { SettingsForm } from './components/SettingsForm';
import { ContractorCard } from './components/ContractorCard';

type Tab = 'home' | 'history' | 'settings' | 'contractor';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { state } = useApp();

  const { lat, lon } = state.settings.location;
  const pentUrl = `https://pent.no/${lat},${lon}`;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: 'Hjem', icon: '🏠' },
    { id: 'history', label: 'Historikk', icon: '📋' },
    { id: 'contractor', label: 'Kontakt', icon: '📞' },
    { id: 'settings', label: 'Innstillinger', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="bg-slate-800 shadow-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">❄️ Snømåkingsanalysator</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-blue-400">📍</span>
            <span className="text-lg font-medium text-blue-300">{state.settings.location.name}</span>
          </div>
          <a 
            href={pentUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 mt-2"
          >
            Data: Meteorologisk institutt (Pent.no) →
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {activeTab === 'home' && (
          <>
            <WeatherCard />
            <SnowStatusCard />
            <ForecastChart />
          </>
        )}

        {activeTab === 'history' && <HistoryTable />}

        {activeTab === 'contractor' && <ContractorCard />}

        {activeTab === 'settings' && <SettingsForm />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 bg-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
