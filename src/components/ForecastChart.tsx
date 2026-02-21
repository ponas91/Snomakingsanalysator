import { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../hooks/useApp';
import { getWeatherConditionEmoji, getWeatherConditionLabel } from '../services/metno';

export function ForecastChart() {
  const { state } = useApp();
  const { weather, settings } = state;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!weather) return [];

    return weather.hourly.slice(0, 24).map((entry) => {
      const date = new Date(entry.time);
      return {
        time: date.getHours().toString().padStart(2, '0') + ':00',
        snow: entry.snow,
        precipitationType: entry.precipitationType,
        precipitation: entry.precipitation,
        temperature: entry.temperature,
        weatherCondition: entry.weatherCondition,
      };
    });
  }, [weather]);

  const getPrecipIcon = (type: string) => {
    if (type === 'snow') return '❄️';
    if (type === 'sleet') return '🌨️';
    return '🌧️';
  };

  if (!weather || chartData.length === 0 || dimensions.width <= 0 || dimensions.height <= 0) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3 mb-4">Snøprognose (24 timer)</h2>
        <div className="h-48 flex items-center justify-center text-slate-400">
          Laster diagram...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-3 mb-4">Snøprognose (24 timer)</h2>
      
      <div ref={containerRef} className="h-48 w-full overflow-hidden" style={{ minHeight: '192px', minWidth: '0' }}>
        <ResponsiveContainer width="100%" height={192}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval={3}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f1f5f9',
              }}
              formatter={(value, name, props) => {
                if (name === 'snow') {
                  const hasPrecip = props.payload.precipitation > 0;
                  const icon = hasPrecip 
                    ? getPrecipIcon(props.payload.precipitationType)
                    : getWeatherConditionEmoji(props.payload.weatherCondition);
                  const label = hasPrecip 
                    ? 'Nedbør'
                    : getWeatherConditionLabel(props.payload.weatherCondition);
                  return [
                    `${icon} ${Number(value).toFixed(1)} mm\n🌡️ ${props.payload.temperature}°C`,
                    label
                  ];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Kl. ${label}`}
            />
            <Bar 
              dataKey="snow" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-400">
        <span>Terskel: {settings.snowThreshold.toFixed(1)} mm</span>
        <span>Total: {chartData.reduce((sum, d) => sum + d.snow, 0).toFixed(1)} mm</span>
      </div>
    </div>
  );
}
