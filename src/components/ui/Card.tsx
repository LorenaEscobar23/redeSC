import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''} transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  blue?: boolean;
}

export function CardHeader({ title, subtitle, action, blue = false }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-6 pb-4 ${blue ? 'border-b-2 border-blue-400' : 'border-b border-gray-100'}`}>
      <div>
        <h3 className={`text-base font-semibold ${blue ? 'text-blue-600' : 'text-gray-900'}`}>{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
