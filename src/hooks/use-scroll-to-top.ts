import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

// Auto-scroll to top for specific button clicks only
export const initializeGlobalScrollToTop = () => {
  // Add event listener for all button clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button') || target.closest('[role="button"]') || target.closest('a[href]');

    // Skip if button has no-scroll class or is in label editor
    if (
      button?.classList.contains('no-scroll') ||
      button?.closest('.label-editor') ||
      target.classList.contains('no-scroll') ||
      target.closest('.label-editor')
    ) {
      return;
    }

    // Only scroll for navigation links and major page actions
    if (
      target.closest('nav') || // Navigation links
      target.closest('.main-cta') || // Main call-to-action buttons
      button?.getAttribute('href')?.startsWith('/') // Internal navigation links
    ) {
      // Small delay to ensure any navigation happens first
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  });
};
