"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
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

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg backdrop-blur-md ${
        type === "success"
          ? "bg-green-500/90 text-white"
          : "bg-red-500/90 text-white"
      } animate-in slide-in-from-bottom-5`}
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}

