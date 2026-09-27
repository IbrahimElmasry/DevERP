import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeType?: 'neutral' | 'positive' | 'warning' | 'negative';
  contextNote?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  badgeText,
  badgeType = 'neutral',
  contextNote,
}) => {
  const badgeStyles = {
    neutral: 'text-slate-400 bg-slate-800/80 border-slate-700/60',
    positive: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    warning: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    negative: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
  };

  return (
    <div className="bg-[#111827] border border-slate-800/90 rounded-lg p-5 flex flex-col justify-between transition-all hover:border-slate-700/80">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{label}</span>
          {badgeText && (
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${badgeStyles[badgeType]}`}>
              {badgeText}
            </span>
          )}
          {Icon && !badgeText && (
            <Icon className="w-4 h-4 text-slate-500" />
          )}
        </div>

        <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1 tabular-nums">
          {value}
        </div>

        {subValue && (
          <div className="text-xs font-mono text-slate-400 mt-1 tabular-nums">
            {subValue}
          </div>
        )}
      </div>

      {contextNote && (
        <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-800/60">
          {contextNote}
        </div>
      )}
    </div>
  );
};
