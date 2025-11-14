import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "light" | "dark";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", variant, ...props }, ref) => {
    // Detect dark theme by route, but allow explicit override via variant
    const isAccountPage = typeof window !== "undefined" && window.location.pathname === "/account";
    const themeVariant = variant ?? (isAccountPage ? "dark" : "light");
    const isDark = themeVariant === "dark";
    
    return (
      <div className="w-full">
        {label && (
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-white/90" : "text-gray-700"
            }`}
          >
            {label}
            {props.required && (
              <span className={`ml-1 ${isDark ? "text-white" : "text-red-500"}`}>*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          className={`ss-textarea ${isDark ? "ss-input-dark" : ""} ${
            error ? "border-red-300 focus:ring-red-300" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className={`mt-1 text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

