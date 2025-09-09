import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface CompactStatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  children?: ReactNode;
  className?: string;
}

export default function CompactStatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-500',
  trend,
  children,
  className = ''
}: CompactStatWidgetProps) {
  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 p-4 
      hover:shadow-sm transition-shadow duration-200
      ${className}
    `}>
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className={`p-1.5 rounded-md bg-gray-50 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xs font-medium text-gray-600 mb-1">{title}</h3>

      {/* Main Value */}
      <div className="mb-2">
        <span className="text-lg font-bold text-gray-900">{value}</span>
        {subtitle && (
          <span className="text-xs text-gray-500 ml-1">{subtitle}</span>
        )}
      </div>

      {/* Additional Content */}
      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}

      {/* Trend Label */}
      {trend && (
        <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
      )}
    </div>
  );
}