import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          ref={ref}
          className={`ss-textarea ${isAccountPage ? 'ss-input-dark' : ''} ${error ? "border-red-300 focus:ring-red-300" : ""} ${className}`}
          {...props}
        />
        {error && <p className={`mt-1 text-sm ${isAccountPage ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

