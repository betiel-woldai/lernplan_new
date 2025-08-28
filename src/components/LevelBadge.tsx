interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function LevelBadge({ 
  level, 
  size = 'md',
  animated = false 
}: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-yellow-400 to-orange-500
        rounded-full
        flex items-center justify-center
        font-bold text-white
        shadow-lg
        border-2 border-yellow-300
        ${animated ? 'animate-pulse-xp' : ''}
        transition-all duration-300 hover:scale-110
      `}
      data-testid="level-badge"
    >
      <span>{level}</span>
    </div>
  );
}