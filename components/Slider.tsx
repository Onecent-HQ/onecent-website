import { InputHTMLAttributes, forwardRef, useState, useEffect } from "react";

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
    const [inputValue, setInputValue] = useState(value.toString());

    // Sync input value when prop value changes (from slider)
    useEffect(() => {
      setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setInputValue(rawValue);
    };

    const handleInputBlur = () => {
      // Validate and clamp value on blur
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue)) {
        // Invalid input, reset to current value
        setInputValue(value.toString());
        return;
      }
      
      // Clamp to min/max bounds
      const clampedValue = Math.max(min, Math.min(max, numValue));
      
      // Round to step if step is defined
      const roundedValue = step ? Math.round(clampedValue / step) * step : clampedValue;
      
      setInputValue(roundedValue.toString());
      onChange(roundedValue);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur(); // Trigger validation on Enter
      }
    };

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-medium ${isAccountPage ? 'text-white/90' : 'text-gray-700'}`}>
            {label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className={`w-24 px-2 py-1 text-sm font-semibold rounded border transition-colors ${
                isAccountPage 
                  ? 'bg-white/5 text-white border-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
              }`}
            />
            {formatValue && (
              <span className={`text-sm font-semibold ${isAccountPage ? 'text-white/60' : 'text-gray-500'}`}>
                ({displayValue})
              </span>
            )}
          </div>
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isAccountPage ? 'bg-white/10 accent-white' : 'bg-gray-200 accent-accent'} ${className}`}
          style={isAccountPage ? { 
            background: `linear-gradient(to right, rgb(255 255 255) 0%, rgb(255 255 255) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`
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

