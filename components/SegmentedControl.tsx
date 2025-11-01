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
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="inline-flex rounded-xl bg-gray-100 p-1 w-full">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? "bg-white text-accent shadow-sm"
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

