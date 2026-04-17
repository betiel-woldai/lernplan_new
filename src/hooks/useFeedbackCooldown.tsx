import { useState, useEffect, useCallback } from 'react';

interface FeedbackCooldownState {
  canShowFeedback: boolean;
  isChecking: boolean;
  lastSubmission: {
    id: number;
    createdAt: string;
    triggerAction: string;
    rating: number | null;
    hasComment: boolean;
  } | null;
}

export function useFeedbackCooldown() {
  const [state, setState] = useState<FeedbackCooldownState>({
    canShowFeedback: false,
    isChecking: true,
    lastSubmission: null
  });

  const checkCooldown = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true }));

    try {
      const basePath = process.env.NODE_ENV === 'production' ? '/dias/lernplaner' : '';
      const response = await fetch(`${basePath}/api/feedback/check-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          canShowFeedback: data.canSubmit,
          isChecking: false,
          lastSubmission: data.lastSubmission
        });
      } else {
        // If check fails, default to not showing feedback to be safe
        setState({
          canShowFeedback: false,
          isChecking: false,
          lastSubmission: null
        });
      }
    } catch (error) {
      console.error('Failed to check feedback cooldown:', error);
      // On error, default to not showing feedback
      setState({
        canShowFeedback: false,
        isChecking: false,
        lastSubmission: null
      });
    }
  }, []);

  // Check cooldown on mount
  useEffect(() => {
    checkCooldown();
  }, [checkCooldown]);

  return {
    canShowFeedback: state.canShowFeedback,
    isChecking: state.isChecking,
    lastSubmission: state.lastSubmission,
    recheckCooldown: checkCooldown
  };
}
