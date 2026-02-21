import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

export function ForecastChart() {
  const { state } = useApp();
  const { weather, settings } = state;

  const chartData = useMemo(() => {
    if (!weather) return [];

    return weather.hourly.slice(0, 24).map((entry) => {
      const date = new Date(entry.time);
      return {
        time: date.getHours().toString().padStart(2, '0') + ':00',
        snow: entry.snow,
        temp: entry.temperature,
      };
    });
  }, [weather]);

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Snøprognose (24 timer)</h2>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval={3}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: 'cm', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f1f5f9',
              }}
              formatter={(value) => [`${Number(value).toFixed(1)} cm`, 'Snø']}
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
        <span>Terskel: {settings.snowThreshold} cm</span>
        <span>Total: {chartData.reduce((sum, d) => sum + d.snow, 0).toFixed(1)} cm</span>
      </div>
    </div>
  );
}
