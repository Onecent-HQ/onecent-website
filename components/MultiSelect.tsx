"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  allowOther?: boolean;
  maxSelections?: number;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Select options...",
  allowOther = false,
  maxSelections = 6,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else if (value.length < maxSelections) {
      onChange([...value, option]);
    }
  };

  const handleAddOther = () => {
    if (otherValue.trim() && !value.includes(otherValue.trim()) && value.length < maxSelections) {
      onChange([...value, otherValue.trim()]);
      setOtherValue("");
    }
  };

  const handleRemove = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className="w-full relative z-50" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        ref={dropdownRef}
        className="ss-input min-h-[3rem] flex flex-wrap gap-2 items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          value.map((item) => (
            <span key={item} className="ss-chip">
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="ss-chip-remove"
                aria-label={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                handleToggle(option);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                value.includes(option) ? "bg-accent/10 text-accent font-medium" : ""
              }`}
            >
              {option}
            </button>
          ))}
          {allowOther && (
            <div className="border-t border-gray-200 p-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otherValue}
                  onChange={(e) => setOtherValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOther();
                    }
                  }}
                  placeholder="Other..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={handleAddOther}
                  className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {value.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
}

