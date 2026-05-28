import type { ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
}

const config: Record<AlertType, { icon: ReactNode; classes: string }> = {
  success: { icon: <CheckCircle size={18} />, classes: 'bg-green-50 border-green-200 text-green-800' },
  error: { icon: <XCircle size={18} />, classes: 'bg-red-50 border-red-200 text-red-800' },
  warning: { icon: <AlertTriangle size={18} />, classes: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  info: { icon: <Info size={18} />, classes: 'bg-blue-50 border-blue-200 text-blue-800' },
};

export function Alert({ type, title, children }: AlertProps) {
  const { icon, classes } = config[type];
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${classes}`}>
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        {title && <p className="font-medium text-sm mb-0.5">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
