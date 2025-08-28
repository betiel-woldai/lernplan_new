import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
  xpGained?: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  onClose,
  xpGained = 0
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      triggerConfetti();
      
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // handleClose is stable, so we can omit it

  const triggerConfetti = () => {
    // Multiple confetti bursts for dramatic effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // First burst from center
    confetti({
      ...defaults,
      particleCount: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32']
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 200);

    // Continuous smaller bursts
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen && isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      data-testid="level-up-modal"
    >
      <div 
        className={`glass-card p-8 rounded-2xl border-2 border-yellow-400/50 shadow-2xl max-w-md w-full mx-4 text-center transform transition-all duration-500 ${
          isOpen && isAnimating ? 'scale-100 rotate-0' : 'scale-75 -rotate-12'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.3)'
        }}
      >
        {/* Animated Level Badge */}
        <div className="relative mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-3xl font-bold text-white shadow-lg transform transition-all duration-1000 ${
            isAnimating ? 'scale-110 rotate-360' : 'scale-100'
          }`}>
            {newLevel}
          </div>
          <div className="absolute -top-2 -right-2 animate-ping">
            <div className="w-6 h-6 bg-yellow-400 rounded-full opacity-75"></div>
          </div>
        </div>

        {/* Congratulations Text */}
        <div className="mb-6 space-y-2">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
            Level Up!
          </h2>
          <p className="text-xl text-white/90">
            Congratulations! You&apos;ve reached
          </p>
          <p className="text-2xl font-bold text-yellow-400">
            Level {newLevel}
          </p>
          {xpGained > 0 && (
            <p className="text-lg text-green-400">
              +{xpGained} XP earned!
            </p>
          )}
        </div>

        {/* Achievement Icons */}
        <div className="mb-6 flex justify-center space-x-2">
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🏆</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🚀</span>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
          data-testid="level-up-close"
        >
          Continue Learning!
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;