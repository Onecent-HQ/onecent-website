import { ReactNode } from "react";

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}

export default function SegmentedControl({
  value,
  onChange,
  options,
  label,
}: SegmentedControlProps) {
  const isAccountPage = typeof window !== 'undefined' && window.location.pathname === '/account';
  
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isAccountPage ? 'text-white/90' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <div className={`inline-flex rounded-xl p-1 w-full ${isAccountPage ? 'bg-white/10' : 'bg-gray-100'}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? isAccountPage
                  ? "bg-white/20 text-orange-500 shadow-sm"
                  : "bg-white text-accent shadow-sm"
                : isAccountPage
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

