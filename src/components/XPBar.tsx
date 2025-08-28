interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  currentLevel: number;
  animated?: boolean;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function XPBar({
  currentXP,
  nextLevelXP, 
  currentLevel,
  animated = true,
  showNumbers = true,
  size = 'md'
}: XPBarProps) {
  // Calculate XP for current level
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
  const progressXP = currentXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progress = Math.max(0, Math.min(100, (progressXP / neededXP) * 100));

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className="w-full" data-testid="xp-bar">
      {showNumbers && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">
            Level {currentLevel}
          </span>
          <span className="text-xs text-gray-500">
            {progressXP.toLocaleString()} / {neededXP.toLocaleString()} XP
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`
            h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full
            ${animated ? 'xp-fill' : ''}
            transition-all duration-1000 ease-out
          `}
          style={{ width: `${progress}%` }}
          data-testid="xp-progress-bar"
        />
      </div>
      
      {showNumbers && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">
            {progress.toFixed(1)}% bis Level {currentLevel + 1}
          </span>
          <span className="text-xs font-semibold text-blue-600">
            {(neededXP - progressXP).toLocaleString()} XP verbleibend
          </span>
        </div>
      )}
    </div>
  );
}