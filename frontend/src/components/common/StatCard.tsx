import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  colorScheme?: 'teal' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo';
  onClick?: () => void;
  className?: string;
}

const colorStyles = {
  teal: {
    iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
    borderHover: 'hover:border-teal-300',
    badge: 'bg-teal-50 text-teal-700',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    borderHover: 'hover:border-emerald-300',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  cyan: {
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    borderHover: 'hover:border-cyan-300',
    badge: 'bg-cyan-50 text-cyan-700',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    borderHover: 'hover:border-amber-300',
    badge: 'bg-amber-50 text-amber-700',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    borderHover: 'hover:border-rose-300',
    badge: 'bg-rose-50 text-rose-700',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    borderHover: 'hover:border-indigo-300',
    badge: 'bg-indigo-50 text-indigo-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'teal',
  onClick,
  className = '',
}) => {
  const styles = colorStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + styles.borderHover : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.neutral
                ? 'bg-slate-100 text-slate-600'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-[11px] text-slate-400">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
