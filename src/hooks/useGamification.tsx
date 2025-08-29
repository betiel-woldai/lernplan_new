import { useState, useCallback, useEffect } from 'react';
import { getLevel } from '../utils/formatters';
import { playXPGainSound, playAchievementSound, playLevelUpSound } from '../utils/audio';

export interface GamificationEvent {
  type: 'xp_gain' | 'level_up' | 'achievement_unlock' | 'streak_milestone';
  data: any;
  timestamp: number;
}

export interface GamificationState {
  currentXP: number;
  currentLevel: number;
  streak: number;
  achievements: Array<{
    name: string;
    icon: string;
    category: string;
    unlockedAt?: number;
    isNew?: boolean;
  }>;
  events: GamificationEvent[];
  levelUpModalOpen: boolean;
  newLevelReached?: number;
}

const INITIAL_STATE: GamificationState = {
  currentXP: 0,
  currentLevel: 1,
  streak: 0,
  achievements: [],
  events: [],
  levelUpModalOpen: false
};

export const useGamification = () => {
  const [state, setState] = useState<GamificationState>(INITIAL_STATE);

  // Add XP and trigger events
  const addXP = useCallback((amount: number, source: string = 'generic') => {
    setState(prevState => {
      const newXP = prevState.currentXP + amount;
      const oldLevel = prevState.currentLevel;
      const newLevel = getLevel(newXP);
      
      const newEvent: GamificationEvent = {
        type: 'xp_gain',
        data: { amount, source, newXP, oldLevel, newLevel },
        timestamp: Date.now()
      };

      const events = [...prevState.events, newEvent];
      
      // Check for level up
      let levelUpModalOpen = false;
      let newLevelReached = undefined;
      
      if (newLevel > oldLevel) {
        levelUpModalOpen = true;
        newLevelReached = newLevel;
        
        events.push({
          type: 'level_up',
          data: { oldLevel, newLevel, xpGained: amount },
          timestamp: Date.now()
        });
      }

      return {
        ...prevState,
        currentXP: newXP,
        currentLevel: newLevel,
        events,
        levelUpModalOpen,
        newLevelReached
      };
    });

    // Trigger XP toast and sound
    if ((window as any).triggerXPToast) {
      (window as any).triggerXPToast(amount, 'xp');
    }
    
    // Play appropriate sound
    const newLevel = getLevel(state.currentXP + amount);
    if (newLevel > state.currentLevel) {
      playLevelUpSound();
    } else {
      playXPGainSound();
    }
  }, []);

  // Unlock achievement
  const unlockAchievement = useCallback((achievement: {
    name: string;
    icon: string;
    category: string;
    description?: string;
  }) => {
    setState(prevState => {
      const existingAchievement = prevState.achievements.find(a => a.name === achievement.name);
      if (existingAchievement) return prevState; // Already unlocked

      const newAchievement = {
        ...achievement,
        unlockedAt: Date.now(),
        isNew: true
      };

      const newEvent: GamificationEvent = {
        type: 'achievement_unlock',
        data: achievement,
        timestamp: Date.now()
      };

      // Trigger achievement toast and sound
      if ((window as any).triggerXPToast) {
        (window as any).triggerXPToast(0, 'achievement', `Unlocked: ${achievement.name}`);
      }
      
      // Play achievement sound
      playAchievementSound();

      return {
        ...prevState,
        achievements: [...prevState.achievements, newAchievement],
        events: [...prevState.events, newEvent]
      };
    });
  }, []);

  // Update streak
  const updateStreak = useCallback((newStreak: number) => {
    setState(prevState => {
      if (newStreak === prevState.streak) return prevState;

      const events = [...prevState.events];
      
      // Check for streak milestones
      const milestones = [7, 14, 30, 50, 100];
      const reachedMilestone = milestones.find(m => newStreak >= m && prevState.streak < m);
      
      if (reachedMilestone) {
        events.push({
          type: 'streak_milestone',
          data: { milestone: reachedMilestone, streak: newStreak },
          timestamp: Date.now()
        });

        // Trigger streak toast
        if ((window as any).triggerXPToast) {
          (window as any).triggerXPToast(0, 'streak', `${reachedMilestone} Day Streak!`);
        }

        // Auto-unlock streak achievements
        if (reachedMilestone === 7) {
          setTimeout(() => unlockAchievement({
            name: 'Week Warrior',
            icon: '⚡',
            category: 'streak',
            description: 'Maintained a 7-day learning streak'
          }), 1000);
        } else if (reachedMilestone === 30) {
          setTimeout(() => unlockAchievement({
            name: 'Monthly Master',
            icon: '🌟',
            category: 'streak',
            description: 'Maintained a 30-day learning streak'
          }), 1000);
        }
      }

      return {
        ...prevState,
        streak: newStreak,
        events
      };
    });
  }, [unlockAchievement]);

  // Mark achievements as seen
  const markAchievementsAsSeen = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      achievements: prevState.achievements.map(a => ({ ...a, isNew: false }))
    }));
  }, []);

  // Close level up modal
  const closeLevelUpModal = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      levelUpModalOpen: false,
      newLevelReached: undefined
    }));
  }, []);

  // Simulate learning activity (for demo purposes)
  const simulateLearningActivity = useCallback(() => {
    const activities = [
      { xp: 25, source: 'Completed lesson' },
      { xp: 50, source: 'Finished quiz' },
      { xp: 15, source: 'Daily practice' },
      { xp: 100, source: 'Project milestone' },
      { xp: 30, source: 'Exercise completed' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    addXP(activity.xp, activity.source);
  }, [addXP]);

  // Reset gamification state (for testing)
  const resetGamification = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // Get recent events
  const getRecentEvents = useCallback((limit: number = 10) => {
    return state.events
      .slice(-limit)
      .reverse();
  }, [state.events]);

  // Get new achievements count
  const getNewAchievementsCount = useCallback(() => {
    return state.achievements.filter(a => a.isNew).length;
  }, [state.achievements]);

  return {
    // State
    ...state,
    
    // Actions
    addXP,
    unlockAchievement,
    updateStreak,
    markAchievementsAsSeen,
    closeLevelUpModal,
    
    // Utilities
    simulateLearningActivity,
    resetGamification,
    getRecentEvents,
    getNewAchievementsCount
  };
};

export default useGamification;