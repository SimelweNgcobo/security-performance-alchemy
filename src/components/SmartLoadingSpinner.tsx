import React, { useEffect, useState } from 'react';
import { loadingStateManager } from '@/utils/loadingStateManager';
import LoadingSpinner from './LoadingSpinner';

interface SmartLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  forceShow?: boolean; // Force show regardless of state
  minDisplayTime?: number; // Minimum time to show spinner (prevents flashing)
}

const SmartLoadingSpinner: React.FC<SmartLoadingSpinnerProps> = ({
  message = "Loading...",
  size = 'md',
  className,
  forceShow = false,
  minDisplayTime = 300
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkShouldShow = () => {
      if (!mounted) return;

      const shouldDisplay = forceShow || loadingStateManager.shouldShowLoading();
      
      if (shouldDisplay && !shouldShow) {
        // Starting to show
        setStartTime(Date.now());
        setShouldShow(true);
      } else if (!shouldDisplay && shouldShow) {
        // Want to hide, but respect minimum display time
        const elapsed = startTime ? Date.now() - startTime : 0;
        
        if (elapsed >= minDisplayTime) {
          setShouldShow(false);
          setStartTime(null);
        } else {
          // Wait for minimum display time
          setTimeout(() => {
            if (mounted) {
              setShouldShow(false);
              setStartTime(null);
            }
          }, minDisplayTime - elapsed);
        }
      }
    };

    // Initial check
    checkShouldShow();

    // Subscribe to loading state changes
    const unsubscribe = loadingStateManager.subscribe(checkShouldShow);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [shouldShow, startTime, forceShow, minDisplayTime]);

  if (!shouldShow) {
    return null;
  }

  return (
    <LoadingSpinner 
      message={message} 
      size={size} 
      className={className} 
    />
  );
};

export default SmartLoadingSpinner;
