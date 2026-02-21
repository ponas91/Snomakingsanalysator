import { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import type { Settings } from '../types';
import { searchPlaces, type GeocodingResult } from '../services/geocoding';
import { requestNotificationPermission } from '../services/notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function SettingsForm() {
  const { state, dispatch, refreshWeather } = useApp();
  const [formData, setFormData] = useState<Settings>(state.settings);
  const [saved, setSaved] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [searchQuery, setSearchQuery] = useState(state.settings.location.name);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handleLocationChange('name', value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setIsSearching(true);

    searchTimeoutRef.current = window.setTimeout(async () => {
      const results = await searchPlaces(value);
      setSuggestions(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: GeocodingResult) => {
    setSearchQuery(suggestion.name);
    setFormData((prev) => ({
      ...prev,
      location: {
        name: suggestion.name,
        lat: suggestion.lat,
        lon: suggestion.lon,
      },
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setSaved(false);
  };

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: formData });
    refreshWeather();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-[#3B4252] rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-[#ECEFF4] mb-4">Innstillinger</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-[#D8DEE9] mb-3">Lokasjon</h3>
          <div className="space-y-3" ref={containerRef}>
            <div>
              <label className="block text-sm text-[#D8DEE9] mb-1">Sted</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Søk etter et sted..."
                  className="w-full px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#88C0D0] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#434C5E] border border-[#4C566A] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-3 py-2 text-left text-sm text-[#D8DEE9] hover:bg-[#4C566A] transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="font-medium">{suggestion.name}</div>
                        <div className="text-xs text-[#4C566A] truncate">
                          {suggestion.display_name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showSuggestions && !isSearching && suggestions.length === 0 && searchQuery.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#434C5E] border border-[#4C566A] rounded-lg shadow-lg p-3 text-sm text-[#4C566A]">
                    Ingen steder funnet
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#D8DEE9] mb-1">Breddegrad</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lat}
                  onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#D8DEE9] mb-1">Lengdegrad</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lon}
                  onChange={(e) => handleLocationChange('lon', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
                />
              </div>
            </div>
            <p className="text-xs text-[#4C566A]">
              Velg et sted fra listen, eller skriv inn koordinater manuelt.
            </p>
          </div>
        </div>

        <div className="border-t border-[#4C566A] pt-4">
          <h3 className="font-medium text-[#D8DEE9] mb-3">Varslingsinnstillinger</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[#D8DEE9] mb-1">
                Snøterskel (cm)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.snowThreshold}
                onChange={(e) => handleChange('snowThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#434C5E] border border-[#4C566A] rounded-lg text-white focus:ring-2 focus:ring-[#88C0D0] focus:border-[#88C0D0]"
              />
              <p className="text-xs text-[#4C566A] mt-1">
                Du vil bli varslet når det er ventet mer enn dette.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-[#D8DEE9]">Varsle ved snø</label>
                <p className="text-xs text-[#4C566A]">Få beskjed når det begynner å snø</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!formData.notifyOnSnow) {
                    const granted = await requestNotificationPermission();
                    if (!granted) return;
                  }
                  handleChange('notifyOnSnow', !formData.notifyOnSnow);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.notifyOnSnow ? 'bg-[#88C0D0]' : 'bg-[#4C566A]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.notifyOnSnow ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-[#D8DEE9]">Varsle på dagtid</label>
                <p className="text-xs text-[#4C566A]">Kl. 09:00 - 18:00</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notifyDay', !formData.notifyDay)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.notifyDay ? 'bg-[#88C0D0]' : 'bg-[#4C566A]'
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
                <label className="text-sm text-[#D8DEE9]">Varsle på natttid</label>
                <p className="text-xs text-[#4C566A]">Kl. 18:00 - 09:00</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('notifyNight', !formData.notifyNight)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.notifyNight ? 'bg-[#88C0D0]' : 'bg-[#4C566A]'
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
          className="w-full px-4 py-2 bg-[#5E81AC] text-white rounded-lg hover:bg-[#81A1C1] transition-colors"
        >
          {saved ? 'Lagret!' : 'Lagre innstillinger'}
        </button>

        {isInstallable && (
          <div className="border-t border-[#4C566A] pt-4">
            <h3 className="font-medium text-[#D8DEE9] mb-3">Installer appen</h3>
            <p className="text-xs text-[#4C566A] mb-3">
              Installer appen på enheten din for raskere tilgang og bedre opplevelse.
            </p>
            <button
              onClick={handleInstall}
              className="w-full px-4 py-3 bg-[#A3BE8C] text-white rounded-lg hover:bg-[#81A1C1] transition-colors flex items-center justify-center gap-2"
            >
              <span>📲</span>
              <span>Installer på {/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'enhet' : 'skrivebord'}</span>
            </button>
          </div>
        )}

        <div className="border-t border-[#4C566A] pt-4">
          <h3 className="font-medium text-[#D8DEE9] mb-3">Tilbakemelding</h3>
          <p className="text-xs text-[#4C566A] mb-3">
            Fant du en feil eller har forslag til forbedringer? Send en e-post til oss.
          </p>
          <a
            href="mailto:jonas.duvsethe91@gmail.com?subject=Snømåkingsanalysator - Tilbakemelding"
            className="block w-full px-4 py-2 bg-[#4C566A] text-white text-center rounded-lg hover:bg-[#5E81AC] transition-colors"
          >
            ✉️ Send tilbakemelding
          </a>
        </div>
      </div>
    </div>
  );
}
