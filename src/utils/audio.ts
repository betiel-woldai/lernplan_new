// Audio utility for notification sounds

export const playNotificationSound = (type: 'success' | 'achievement' | 'levelup' = 'success') => {
  try {
    // Create audio context for programmatic sound generation
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, duration: number, delay: number = 0) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }, delay);
    };

    switch (type) {
      case 'success':
        // Simple success beep: C5 -> E5
        playTone(523, 0.15, 0);
        playTone(659, 0.2, 150);
        break;
        
      case 'achievement':
        // Achievement fanfare: C5 -> E5 -> G5 -> C6
        playTone(523, 0.1, 0);
        playTone(659, 0.1, 100);
        playTone(784, 0.1, 200);
        playTone(1047, 0.3, 300);
        break;
        
      case 'levelup':
        // Level up celebration: Rising scale
        playTone(523, 0.1, 0);   // C5
        playTone(587, 0.1, 100); // D5
        playTone(659, 0.1, 200); // E5
        playTone(784, 0.1, 300); // G5
        playTone(1047, 0.4, 400); // C6
        break;
    }
  } catch (error) {
    console.log('Audio not supported or blocked:', error);
  }
};

export const playXPGainSound = () => {
  playNotificationSound('success');
};

export const playAchievementSound = () => {
  playNotificationSound('achievement');
};

export const playLevelUpSound = () => {
  playNotificationSound('levelup');
};