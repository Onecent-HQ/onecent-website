import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    // Check if we're in account page (dark theme)
    const isAccountPage = typeof window !== 'undefined' && window.location.pathname === '/account';
    
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium mb-2 ${isAccountPage ? 'text-white/90' : 'text-gray-700'}`}>
            {label}
            {props.required && <span className={`ml-1 ${isAccountPage ? 'text-orange-500' : 'text-red-500'}`}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`ss-input ${isAccountPage ? 'ss-input-dark' : ''} ${error ? "border-red-300 focus:ring-red-300" : ""} ${className}`}
          {...props}
        />
        {error && <p className={`mt-1 text-sm ${isAccountPage ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

