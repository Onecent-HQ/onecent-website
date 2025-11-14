"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  allowOther?: boolean;
  maxSelections?: number;
  dropdownMode?: "overlay" | "inline";
  portal?: boolean;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Select options...",
  allowOther = false,
  maxSelections = 6,
  dropdownMode = "overlay",
  portal = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAccountPage = typeof window !== 'undefined' && window.location.pathname === '/account';
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        (!menuRef.current || !menuRef.current.contains(event.target as Node))
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

  // Position the dropdown when using a portal so it pops out of overflow containers
  useEffect(() => {
    if (!isOpen || !portal || !dropdownRef.current) return;

    const updatePosition = () => {
      if (!dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, portal]);

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

  const isInline = dropdownMode === "inline" && !portal;
  const usePortalMenu = portal && typeof document !== "undefined";

  const menu = (
    <div
      ref={menuRef}
      className={`w-full mt-1 rounded-xl shadow-xl border max-h-60 overflow-auto ${
        isAccountPage ? "bg-black border-white/20" : "bg-white border-gray-200"
      }`}
    >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                handleToggle(option);
              }}
              className={`w-full text-left px-4 py-2 transition-colors ${
                isAccountPage
                  ? value.includes(option)
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  : value.includes(option)
                    ? "bg-accent/10 text-accent font-medium hover:bg-gray-50"
                    : "hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
          {allowOther && (
            <div className={`border-t p-2 ${isAccountPage ? 'border-white/10' : 'border-gray-200'}`}>
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
                  className={`flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    isAccountPage
                      ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:ring-white/20 focus:border-white'
                      : 'border-gray-300 focus:ring-accent/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddOther}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isAccountPage
                      ? 'bg-black text-white hover:bg-gray-900 border border-white/20'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
  );

  return (
    <div className={`w-full ${isInline || usePortalMenu ? "" : "relative z-50"}`} ref={containerRef}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isAccountPage ? 'text-white/90' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <div
        ref={dropdownRef}
        className={`ss-input ${isAccountPage ? 'ss-input-dark' : ''} min-h-[3rem] flex flex-wrap gap-2 items-center cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className={isAccountPage ? 'text-white/40' : 'text-gray-400'}>{placeholder}</span>
        ) : (
          value.map((item) => (
            <span key={item} className={`ss-chip ${isAccountPage ? 'ss-chip-dark' : ''}`}>
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
        <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${isAccountPage ? 'text-white/60' : 'text-gray-400'} ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <>
          {usePortalMenu && menuPosition
            ? createPortal(
                <div
                  className="absolute z-[9999]"
                  style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                    width: menuPosition.width,
                  }}
                >
                  {menu}
                </div>,
                document.body
              )
            : !isInline
              ? <div className="absolute z-[9999] w-full">{menu}</div>
              : menu}
        </>
      )}
      
      {value.length > 0 && (
        <p className={`mt-1 text-xs ${isAccountPage ? 'text-white/50' : 'text-gray-500'}`}>
          {value.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
}

