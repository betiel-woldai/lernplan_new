import React, { useState, useEffect } from 'react';

export interface Achievement {
  name: string;
  icon: string;
  category: string;
  description?: string;
  unlockedAt?: Date;
  isNew?: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
  animateUnlock?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showDetails = false,
  onClick,
  animateUnlock = false
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (animateUnlock) {
      setIsUnlocking(true);
      const timer = setTimeout(() => setIsUnlocking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animateUnlock]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12 text-lg';
      case 'lg':
        return 'w-20 h-20 text-3xl';
      default:
        return 'w-16 h-16 text-2xl';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tasks':
        return 'from-blue-400 to-blue-600';
      case 'streak':
        return 'from-orange-400 to-red-500';
      case 'time':
        return 'from-green-400 to-green-600';
      case 'level':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const isUnlocked = achievement.unlockedAt != null;
  const hasProgress = achievement.progress != null && achievement.maxProgress != null;

  return (
    <div className="relative">
      <div
        className={`
          relative rounded-full flex items-center justify-center cursor-pointer
          transform transition-all duration-300 hover:scale-110 group
          ${getSizeClasses()}
          ${isUnlocked 
            ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} shadow-lg hover:shadow-xl` 
            : 'bg-gray-600 opacity-50'
          }
          ${isUnlocking ? 'animate-pulse scale-125' : ''}
          ${achievement.isNew ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Achievement Icon */}
        <span className={`
          transition-all duration-300 
          ${isUnlocking ? 'animate-bounce' : ''}
          ${!isUnlocked ? 'grayscale' : ''}
        `}>
          {achievement.icon}
        </span>

        {/* New Achievement Indicator */}
        {achievement.isNew && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping">
            <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Unlock Animation */}
        {isUnlocking && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-ping opacity-75"></div>
        )}

        {/* Progress Ring for Incomplete Achievements */}
        {hasProgress && !isUnlocked && (
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="stroke-gray-300"
              fill="none"
              strokeWidth="2"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="stroke-yellow-400 transition-all duration-1000"
              fill="none"
              strokeWidth="2"
              strokeDasharray={`${(achievement.progress! / achievement.maxProgress!) * 100}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="glass-card px-3 py-2 rounded-lg border border-white/20 shadow-lg backdrop-blur-sm whitespace-nowrap">
            <p className="font-semibold text-white">{achievement.name}</p>
            {achievement.description && (
              <p className="text-sm text-white/80">{achievement.description}</p>
            )}
            {hasProgress && (
              <p className="text-xs text-yellow-400">
                Progress: {achievement.progress}/{achievement.maxProgress}
              </p>
            )}
            {achievement.unlockedAt && (
              <p className="text-xs text-green-400">
                Unlocked: {achievement.unlockedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute top-full mt-2 left-0 z-10 w-64">
          <div className="glass-card p-4 rounded-lg border border-white/20 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getCategoryColor(achievement.category)} flex items-center justify-center text-xl`}>
                {achievement.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{achievement.name}</h3>
                <p className="text-sm text-white/70 capitalize">{achievement.category}</p>
              </div>
            </div>
            {achievement.description && (
              <p className="text-sm text-white/80 mb-3">{achievement.description}</p>
            )}
            {hasProgress && (
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">Progress</span>
                  <span className="text-yellow-400">{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {achievement.unlockedAt && (
              <p className="text-xs text-green-400">
                Unlocked: {achievement.unlockedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;