import { ReactNode } from "react";

interface FieldGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function FieldGroup({
  title,
  description,
  children,
}: FieldGroupProps) {
  // Check if we're in account page (dark theme)
  const isAccountPage = typeof window !== 'undefined' && window.location.pathname === '/account';
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-xl font-semibold mb-2 ${isAccountPage ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        {description && (
          <p className={`text-sm leading-relaxed ${isAccountPage ? 'text-white/70' : 'text-gray-600'}`}>{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

