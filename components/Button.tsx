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
  const baseClasses = "ss-button disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base";
  const variantClasses =
    variant === "secondary"
      ? "bg-white/90 text-gray-800 border-gray-300 hover:bg-white hover:border-gray-400 shadow-md hover:shadow-lg"
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

