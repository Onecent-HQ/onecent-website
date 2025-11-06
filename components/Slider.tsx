import { InputHTMLAttributes, forwardRef } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, min, max, step = 1, value, onChange, formatValue, className = "", ...props }, ref) => {
    const displayValue = formatValue ? formatValue(value) : value.toString();
    const isAccountPage = typeof window !== 'undefined' && window.location.pathname === '/account';

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-medium ${isAccountPage ? 'text-white/90' : 'text-gray-700'}`}>
            {label}
          </label>
          <span className={`text-sm font-semibold ${isAccountPage ? 'text-orange-500' : 'text-accent'}`}>{displayValue}</span>
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isAccountPage ? 'bg-white/10 accent-orange-500' : 'bg-gray-200 accent-accent'} ${className}`}
          style={isAccountPage ? { 
            background: `linear-gradient(to right, rgb(249 115 22) 0%, rgb(249 115 22) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`
          } : {}}
          {...props}
        />
        <div className={`flex justify-between text-xs mt-1 ${isAccountPage ? 'text-white/50' : 'text-gray-500'}`}>
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export default Slider;

