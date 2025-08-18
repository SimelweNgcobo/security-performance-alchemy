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

// Auto-scroll to top for all button clicks globally
export const initializeGlobalScrollToTop = () => {
  // Add event listener for all button clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if clicked element is a button or has button role
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.getAttribute('role') === 'button' ||
      target.closest('[role="button"]') ||
      target.closest('a[href]') // Also include links
    ) {
      // Small delay to ensure any navigation happens first
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  });
};
