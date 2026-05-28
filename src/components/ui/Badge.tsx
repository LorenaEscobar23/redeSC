import type { StatusDemanda } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../types';

interface BadgeProps {
  status: StatusDemanda;
}

export function StatusBadge({ status }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'teal';
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray: 'bg-gray-100 text-gray-700',
  teal: 'bg-teal-100 text-teal-800',
};

export function Badge({ children, color = 'gray' }: GenericBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}
