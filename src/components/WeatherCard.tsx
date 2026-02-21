import { useApp } from '../hooks/useApp';
import { getWeatherConditionEmoji, getWeatherConditionLabel } from '../services/metno';
import { isNightTime } from '../services/notifications';

function getWeatherEmojiWithDayNight(condition: string): string {
  const night = isNightTime();
  
  if (night) {
    const baseEmoji = getWeatherConditionEmoji(condition);
    if (baseEmoji === '☀️') {
      return '🌙';
    }
    return baseEmoji;
  }
  
  return getWeatherConditionEmoji(condition);
}

export function WeatherCard() {
  const { state, refreshWeather } = useApp();
  const { weather, loading, error } = state;
  const { lat, lon } = state.settings.location;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  };

  const precipIcons = {
    snow: '❄️',
    sleet: '🌨️',
    rain: '🌧️'
  };

  const precipLabels = {
    snow: 'Snø (nå)',
    sleet: 'Sludd (nå)',
    rain: 'Regn (nå)'
  };

  const getPrecipLabel = (type: string) => {
    return precipLabels[type as keyof typeof precipLabels] || 'Regn (nå)';
  };

  const pentUrl = `https://pent.no/${lat},${lon}`;

  return (
    <div className="bg-slate-900 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
        <h2 className="text-lg font-semibold text-white">Vær nå</h2>
        <button
          onClick={refreshWeather}
          disabled={loading}
          className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-500 disabled:opacity-50"
        >
          {loading ? 'Oppdaterer...' : 'Oppdater'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 text-sm text-slate-300">
        <span>📍</span>
        <span>{state.settings.location.name}</span>
      </div>

      {weather ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-1">🌡️</div>
            <div className="text-2xl font-bold text-white">{weather.current.temperature}°</div>
            <div className="text-xs text-slate-400">Temperatur</div>
          </div>
          <div className="text-center">
            {weather.current.precipitation > 0 ? (
              <>
                <div className="text-3xl mb-1">{precipIcons[weather.current.precipitationType] || '🌧️'}</div>
                <div className="text-2xl font-bold text-white">{weather.current.snow.toFixed(1)} mm</div>
                <div className="text-xs text-slate-400">{getPrecipLabel(weather.current.precipitationType)}</div>
              </>
            ) : (
              <>
                <div className="text-3xl mb-1">{getWeatherEmojiWithDayNight(weather.current.weatherCondition)}</div>
                <div className="text-2xl font-bold text-white">{getWeatherConditionLabel(weather.current.weatherCondition)}</div>
                <div className="text-xs text-slate-400">Vær</div>
              </>
            )}
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">💨</div>
            <div className="text-2xl font-bold text-white">{weather.current.windSpeed} m/s</div>
            <div className="text-xs text-slate-400">Vind</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-4">
          {loading ? 'Laster værdata...' : 'Ingen værdata tilgjengelig'}
        </div>
      )}

      {weather && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
          <p className="text-xs text-slate-500 text-center">
            Oppdatert: {formatTime(weather.updatedAt)}
          </p>
          <a 
            href={pentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-sky-400 hover:text-sky-300"
          >
            Sjekk varsel på Pent.no →
          </a>
        </div>
      )}
    </div>
  );
}
