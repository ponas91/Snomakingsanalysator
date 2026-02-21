import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Settings } from '../types';

export function SettingsForm() {
  const { state, dispatch, refreshWeather } = useApp();
  const [formData, setFormData] = useState<Settings>(state.settings);
  const [saved, setSaved] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLocationChange = (field: 'name' | 'lat' | 'lon', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: formData });
    refreshWeather();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Innstillinger</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-slate-300 mb-3">Lokasjon</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Sted</label>
              <input
                type="text"
                value={formData.location.name}
                onChange={(e) => handleLocationChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Breddegrad</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lat}
                  onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Lengdegrad</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lon}
                  onChange={(e) => handleLocationChange('lon', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Tips: Søk på Google Maps, høyreklikk på stedet og kopier koordinatene.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <h3 className="font-medium text-slate-300 mb-3">Varslingsinnstillinger</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Snøterskel (cm)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.snowThreshold}
                onChange={(e) => handleChange('snowThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Du vil bli varslet når det er ventet mer enn dette.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-slate-300">Varsle på dagtid</label>
                <p className="text-xs text-slate-500">Kl. 09:00 - 18:00</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notifyDay', !formData.notifyDay)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.notifyDay ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.notifyDay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-slate-300">Varsle på natttid</label>
                <p className="text-xs text-slate-500">Kl. 18:00 - 09:00</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notifyNight', !formData.notifyNight)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.notifyNight ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.notifyNight ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {saved ? 'Lagret!' : 'Lagre innstillinger'}
        </button>

        {isInstallable && (
          <button
            onClick={handleInstall}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📲 Last ned appen
          </button>
        )}
      </div>
    </div>
  );
}
