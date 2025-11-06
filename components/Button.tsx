import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const isAccountPage = typeof window !== 'undefined' && window.location.pathname === '/account';
  const baseClasses = "ss-button disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base";
  const variantClasses =
    variant === "secondary"
      ? isAccountPage
        ? "bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:text-orange-500 hover:border-orange-500/50 shadow-md"
        : "bg-white/90 text-gray-800 border-gray-300 hover:bg-white hover:border-gray-400 shadow-md hover:shadow-lg"
      : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

