import { useApp } from '../context/AppContext';
import type { SnowStatus } from '../types';

interface StatusConfig {
  bg: string;
  border: string;
  text: string;
  icon: string;
  message: string;
}

const statusConfigs: Record<SnowStatus, StatusConfig> = {
  normal: {
    bg: 'bg-green-900/30',
    border: 'border-green-700',
    text: 'text-green-400',
    icon: '✅',
    message: 'Ingen umiddelbar brøyting nødvendig',
  },
  warning: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-700',
    text: 'text-yellow-400',
    icon: '⚠️',
    message: 'Vurder å bestille brøyting',
  },
  critical: {
    bg: 'bg-red-900/30',
    border: 'border-red-700',
    text: 'text-red-400',
    icon: '🚨',
    message: 'Bestill brøyting nå!',
  },
};

export function SnowStatusCard() {
  const { getSnowStatus, state } = useApp();
  const { status, snowAmount } = getSnowStatus();
  const config = statusConfigs[status];
  const threshold = state.settings.snowThreshold;

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h2 className={`text-lg font-semibold ${config.text}`}>
            Snøstatus: {status === 'normal' ? 'Normal' : status === 'warning' ? 'Advarsel' : 'Kritisk'}
          </h2>
          <p className={`text-sm ${config.text} opacity-80`}>{config.message}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-300">
          <span className="font-medium">{snowAmount.toFixed(1)} cm</span> snø ventet (24t)
        </div>
        <div className="text-sm text-slate-500">
          Terskel: {threshold} cm
        </div>
      </div>

      <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            status === 'normal' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min((snowAmount / threshold) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
