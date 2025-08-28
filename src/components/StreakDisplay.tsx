import React, { useState, useEffect } from 'react';
import { FaFire, FaFireFlameCurved } from 'react-icons/fa6';
import { GiFireBowl, GiFlamingClaw } from 'react-icons/gi';

export interface StreakDisplayProps {
  streak: number;
  maxStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  onStreakMilestone?: (milestone: number) => void;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  maxStreak,
  size = 'md',
  showAnimation = true,
  onStreakMilestone
}) => {
  const [isFlaming, setIsFlaming] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(streak);

  useEffect(() => {
    if (streak > previousStreak && showAnimation) {
      setIsFlaming(true);
      const timer = setTimeout(() => setIsFlaming(false), 2000);
      
      // Check for milestone achievements
      const milestones = [7, 14, 30, 50, 100];
      const reachedMilestone = milestones.find(m => streak >= m && previousStreak < m);
      if (reachedMilestone && onStreakMilestone) {
        onStreakMilestone(reachedMilestone);
      }
      
      setPreviousStreak(streak);
      return () => clearTimeout(timer);
    }
  }, [streak, previousStreak, showAnimation, onStreakMilestone]);

  const getFlameIntensity = () => {
    if (streak === 0) return 'none';
    if (streak < 3) return 'weak';
    if (streak < 7) return 'medium';
    if (streak < 14) return 'strong';
    if (streak < 30) return 'intense';
    return 'legendary';
  };

  const getFlameIcon = () => {
    const intensity = getFlameIntensity();
    switch (intensity) {
      case 'none':
        return <FaFire className="text-gray-500" />;
      case 'weak':
        return <FaFire className="text-orange-400" />;
      case 'medium':
        return <FaFireFlameCurved className="text-orange-500" />;
      case 'strong':
        return <GiFireBowl className="text-red-500" />;
      case 'intense':
        return <GiFlamingClaw className="text-red-600" />;
      case 'legendary':
        return <GiFlamingClaw className="text-purple-500" />;
      default:
        return <FaFire className="text-orange-500" />;
    }
  };

  const getFlameColor = () => {
    const intensity = getFlameIntensity();
    switch (intensity) {
      case 'none':
        return 'text-gray-500';
      case 'weak':
        return 'text-orange-400';
      case 'medium':
        return 'text-orange-500';
      case 'strong':
        return 'text-red-500';
      case 'intense':
        return 'text-red-600';
      case 'legendary':
        return 'text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]';
      default:
        return 'text-orange-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'lg':
        return 'text-4xl';
      default:
        return 'text-2xl';
    }
  };

  const getAnimationClasses = () => {
    if (!showAnimation) return '';
    
    const intensity = getFlameIntensity();
    const baseAnimation = isFlaming ? 'animate-pulse scale-110' : '';
    
    switch (intensity) {
      case 'none':
        return baseAnimation;
      case 'weak':
        return `${baseAnimation} animate-pulse`;
      case 'medium':
        return `${baseAnimation} animate-bounce`;
      case 'strong':
        return `${baseAnimation} animate-pulse animate-bounce`;
      case 'intense':
        return `${baseAnimation} animate-pulse animate-spin-slow`;
      case 'legendary':
        return `${baseAnimation} animate-pulse animate-bounce animate-spin-slow drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]`;
      default:
        return baseAnimation;
    }
  };

  const getStreakMessage = () => {
    const intensity = getFlameIntensity();
    switch (intensity) {
      case 'none':
        return 'Start your streak!';
      case 'weak':
        return 'Building momentum!';
      case 'medium':
        return 'Getting hot!';
      case 'strong':
        return 'On fire!';
      case 'intense':
        return 'Unstoppable!';
      case 'legendary':
        return 'LEGENDARY STREAK!';
      default:
        return 'Keep it going!';
    }
  };

  return (
    <div className="flex items-center space-x-3 group" data-testid="streak-display">
      {/* Flame Icon with Animations */}
      <div className={`
        relative transition-all duration-300 transform
        ${getSizeClasses()} ${getFlameColor()} ${getAnimationClasses()}
      `}>
        {getFlameIcon()}
        
        {/* Particle Effect for High Streaks */}
        {getFlameIntensity() === 'legendary' && (
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full bg-purple-500 rounded-full opacity-25"></div>
          </div>
        )}
        
        {/* Flame Flicker Effect */}
        {streak > 0 && showAnimation && (
          <div className="absolute inset-0 opacity-50 animate-pulse">
            {getFlameIcon()}
          </div>
        )}
      </div>

      {/* Streak Counter */}
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-2">
          <span className={`font-bold ${getFlameColor()} ${
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl'
          }`}>
            {streak}
          </span>
          <span className={`text-white/70 ${
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          }`}>
            day{streak !== 1 ? 's' : ''}
          </span>
        </div>
        
        <span className={`text-white/60 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}>
          {getStreakMessage()}
        </span>
        
        {maxStreak && maxStreak > streak && (
          <span className={`text-yellow-400 ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          }`}>
            Best: {maxStreak}
          </span>
        )}
      </div>

      {/* Milestone Indicators */}
      {streak > 0 && (
        <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {[7, 14, 30, 50, 100].map(milestone => (
            <div
              key={milestone}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                streak >= milestone 
                  ? 'bg-yellow-400 scale-110' 
                  : 'bg-gray-600'
              }`}
              title={`${milestone} day milestone`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;