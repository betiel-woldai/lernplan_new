import React, { useEffect, useState } from 'react';

export interface XPToastProps {
  xpGained: number;
  isVisible: boolean;
  onAnimationComplete: () => void;
  position?: { x: number; y: number };
  type?: 'xp' | 'achievement' | 'streak';
  message?: string;
}

export const XPToast: React.FC<XPToastProps> = ({
  xpGained,
  isVisible,
  onAnimationComplete,
  position = { x: 50, y: 50 },
  type = 'xp',
  message
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onAnimationComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  if (!shouldRender && !isVisible) return null;

  const getToastContent = () => {
    switch (type) {
      case 'achievement':
        return (
          <div className="flex items-center space-x-2" data-testid="achievement-unlocked">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-yellow-400">{message}</span>
          </div>
        );
      case 'streak':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-pulse">🔥</span>
            <span className="font-bold text-orange-400">{message}</span>
          </div>
        );
      default:
        // Show only colored indicator, no number (avoids mismatch between approximate and actual XP)
        const isPositive = xpGained >= 0;
        const bgColor = isPositive ? 'bg-green-400' : 'bg-red-400';
        const arrow = isPositive ? '⭐' : '⭐';
        return (
          <div className="flex items-center justify-center">
            <div className={`${bgColor} rounded-full w-12 h-12 flex items-center justify-center`}>
              <span className="text-white text-2xl font-bold">{arrow}</span>
            </div>
          </div>
        );
    }
  };

  const getToastStyles = () => {
    const baseStyles = {
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)'
    };

    return baseStyles;
  };

  return (
    <div
      className={`fixed z-50 pointer-events-none transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={getToastStyles()}
      data-testid="xp-toast"
    >
      <div className="glass-card px-4 py-2 rounded-lg border border-white/20 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2 animate-bounce">
          {getToastContent()}
        </div>
      </div>
    </div>
  );
};

export const XPToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    xpGained: number;
    type: 'xp' | 'achievement' | 'streak';
    message?: string;
    position: { x: number; y: number };
    isVisible: boolean;
  }>>([]);

  const addToast = (
    xpGained: number,
    type: 'xp' | 'achievement' | 'streak' = 'xp',
    message?: string,
    customPosition?: { x: number; y: number }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const position = customPosition || {
      x: Math.random() * 60 + 20, // 20-80% from left
      y: Math.random() * 60 + 20  // 20-80% from top
    };

    setToasts(prev => [...prev, {
      id,
      xpGained,
      type,
      message,
      position,
      isVisible: true
    }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose addToast method globally for easy access
  useEffect(() => {
    (window as any).triggerXPToast = addToast;
    return () => {
      delete (window as any).triggerXPToast;
    };
  }, []);

  return (
    <>
      {toasts.map(toast => (
        <XPToast
          key={toast.id}
          xpGained={toast.xpGained}
          type={toast.type}
          message={toast.message}
          position={toast.position}
          isVisible={toast.isVisible}
          onAnimationComplete={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default XPToast;