"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Dark theme styling to match the app
  const getStyles = () => {
    if (type === "error") {
      return "bg-white/10 border-white/30 text-white";
    }
    if (type === "info") {
      return "bg-white/5 border-white/20 text-white/90";
    }
    // success or default
    return "bg-white/10 border-white/30 text-white";
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-xl border ${getStyles()} animate-in slide-in-from-bottom-5 fade-in`}
      style={{
        animation: "slideInUp 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-2">
        <p className="font-medium text-xs">{message}</p>
        <button
          onClick={onClose}
          className="ml-1 p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

