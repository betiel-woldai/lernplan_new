import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
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

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-500',
  trend,
  children,
  className = ''
}: StatCardProps) {
  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 p-6 
      stat-card-hover
      ${className}
    `}>
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
          <Icon className="w-5 h-5" />
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
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

      {/* Main Value */}
      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtitle && (
          <span className="text-sm text-gray-500 ml-2">{subtitle}</span>
        )}
      </div>

      {/* Additional Content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      {/* Trend Label */}
      {trend && (
        <p className="text-xs text-gray-500 mt-2">{trend.label}</p>
      )}
    </div>
  );
}