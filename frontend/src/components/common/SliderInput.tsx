import React from 'react';

interface SliderInputProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  lowLabel?: string;
  highLabel?: string;
  colorScheme?: 'teal' | 'emerald' | 'amber' | 'rose' | 'indigo';
  unit?: string;
  helperText?: string;
  disabled?: boolean;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  lowLabel = 'Low',
  highLabel = 'High',
  colorScheme = 'teal',
  unit = '',
  helperText,
  disabled = false,
}) => {
  const getBadgeColor = () => {
    if (value == null) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (colorScheme === 'rose') {
      return value > 6 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (colorScheme === 'amber') {
      return value > 6 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-teal-100 text-teal-700 border-teal-200';
    }
    return 'bg-teal-50 text-teal-700 border-teal-200';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor()}`}>
          {value == null ? 'Choose' : `${value} ${unit}`}
        </div>
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

      <div className="relative pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          aria-label={label}
          aria-valuetext={value == null ? 'Choose a value' : `${value}${unit ? ` ${unit}` : ''}`}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
          <span>{min} ({lowLabel})</span>
          <span>{max} ({highLabel})</span>
        </div>
      </div>
    </div>
  );
};

export default SliderInput;
