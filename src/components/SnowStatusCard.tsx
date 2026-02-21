import { useApp } from '../hooks/useApp';
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
    bg: 'bg-[#A3BE8C]/20',
    border: 'border-[#A3BE8C]',
    text: 'text-[#A3BE8C]',
    icon: '✅',
    message: 'Ingen umiddelbar brøyting nødvendig',
  },
  warning: {
    bg: 'bg-[#EBCB8B]/20',
    border: 'border-[#EBCB8B]',
    text: 'text-[#EBCB8B]',
    icon: '⚠️',
    message: 'Vurder å bestille brøyting',
  },
  critical: {
    bg: 'bg-[#BF616A]/20',
    border: 'border-[#BF616A]',
    text: 'text-[#BF616A]',
    icon: '🚨',
    message: 'Bestill brøyting nå!',
  },
};

export function SnowStatusCard() {
  const { getSnowStatus, state } = useApp();
  const { status, snowAmount } = getSnowStatus();
  const config = statusConfigs[status];
  const threshold = state.settings.snowThreshold;

  const thresholdMm = threshold;
  const snowAmountMm = snowAmount;

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-2 border-b border-[#4C566A]/50 pb-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h2 className={`text-lg font-semibold ${config.text}`}>
            Snøstatus: {status === 'normal' ? 'Normal' : status === 'warning' ? 'Advarsel' : 'Kritisk'}
          </h2>
          <p className={`text-sm ${config.text} opacity-80`}>{config.message}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[#D8DEE9]">
          <span className="font-medium">{snowAmountMm.toFixed(1)} mm</span> nedbør ventet (24t)
        </div>
        <div className="text-sm text-[#4C566A]">
          Terskel: {thresholdMm} mm
        </div>
      </div>

      <div className="mt-3 h-2 bg-[#434C5E] rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            status === 'normal' ? 'bg-[#A3BE8C]' : status === 'warning' ? 'bg-[#EBCB8B]' : 'bg-[#BF616A]'
          }`}
          style={{ width: `${Math.min((snowAmount / threshold) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
