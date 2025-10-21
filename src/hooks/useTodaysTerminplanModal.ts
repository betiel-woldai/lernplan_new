import { useState, useEffect } from 'react';
import { getBerlinDateString } from '@/utils/timezone';

const STORAGE_KEY_PREFIX = 'terminplan-popup-dismissed';

export function useTodaysTerminplanModal(hasEvents: boolean) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate today's storage key
  const getTodaysStorageKey = () => {
    const todayBerlin = getBerlinDateString(); // Format: YYYY-MM-DD
    return `${STORAGE_KEY_PREFIX}-${todayBerlin}`;
  };

  // Check if modal was already dismissed today
  const wasDismissedToday = () => {
    if (typeof window === 'undefined') return false;

    try {
      const storageKey = getTodaysStorageKey();
      return localStorage.getItem(storageKey) === 'true';
    } catch (error) {
      console.warn('Error checking localStorage for terminplan modal:', error);
      return false;
    }
  };

  // Clean up old dismissal records (keep only last 30 days)
  const cleanupOldDismissals = () => {
    if (typeof window === 'undefined') return;

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          // Extract date from key: 'terminplan-popup-dismissed-YYYY-MM-DD'
          const datePart = key.replace(`${STORAGE_KEY_PREFIX}-`, '');
          const dismissalDate = new Date(datePart);

          if (dismissalDate < thirtyDaysAgo) {
            localStorage.removeItem(key);
            i--; // Adjust index as we removed an item
          }
        }
      }
    } catch (error) {
      console.warn('Error cleaning up old terminplan dismissals:', error);
    }
  };

  // Show modal when conditions are met
  useEffect(() => {
    if (hasEvents && !wasDismissedToday()) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasEvents]);

  // Clean up old dismissals on mount
  useEffect(() => {
    cleanupOldDismissals();
  }, []);

  const dismissModal = () => {
    setIsModalOpen(false);
  };

  const dismissForToday = () => {
    try {
      const storageKey = getTodaysStorageKey();
      localStorage.setItem(storageKey, 'true');
    } catch (error) {
      console.warn('Error saving terminplan modal dismissal:', error);
    }

    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    dismissModal,
    dismissForToday
  };
}