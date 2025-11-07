import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", icon, ...props }, ref) => {
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
        <div className="relative">
          {icon && (
            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isAccountPage ? 'text-white/60' : 'text-gray-400'}`}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`ss-input ${isAccountPage ? 'ss-input-dark' : ''} ${error ? "border-red-300 focus:ring-red-300" : ""} ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className={`mt-1 text-sm ${isAccountPage ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

