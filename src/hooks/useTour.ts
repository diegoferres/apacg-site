import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep, type Config } from 'driver.js';
import 'driver.js/dist/driver.css';

interface UseTourOptions {
  tourId: string;
  steps: DriveStep[];
  autoStart?: boolean;
  delay?: number;
  onComplete?: () => void;
}

export function useTour({ tourId, steps, autoStart = false, delay = 800, onComplete }: UseTourOptions) {
  const hasStarted = useRef(false);

  const storageKey = `tour_${tourId}_completed`;

  const isTourCompleted = useCallback(() => {
    return localStorage.getItem(storageKey) === 'true';
  }, [storageKey]);

  const markCompleted = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
  }, [storageKey]);

  const startTour = useCallback(() => {
    const driverInstance = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'apacg-tour-popover',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      progressText: '{{current}} de {{total}}',
      steps,
      onDestroyed: () => {
        markCompleted();
        onComplete?.();
      },
    } as Config);

    driverInstance.drive();
  }, [steps, markCompleted, onComplete]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (autoStart && !isTourCompleted() && !hasStarted.current) {
      hasStarted.current = true;
      const timer = setTimeout(() => {
        startTour();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isTourCompleted, startTour, delay]);

  return { startTour, isTourCompleted: isTourCompleted(), resetTour };
}
