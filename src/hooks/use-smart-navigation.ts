import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { pagePreloader } from '@/utils/preloader';
import { loadingStateManager } from '@/utils/loadingStateManager';

/**
 * Smart navigation hook that utilizes preloaded routes for instant navigation
 */
export const useSmartNavigation = () => {
  const navigate = useNavigate();

  const smartNavigate = useCallback((
    to: string, 
    options?: { replace?: boolean; state?: any }
  ) => {
    // Check if route is preloaded
    const isPreloaded = pagePreloader.isRoutePreloaded(to);
    
    if (isPreloaded) {
      // Instant navigation for preloaded routes
      loadingStateManager.hideLoading();
      navigate(to, options);
    } else {
      // Show minimal loading for non-preloaded routes
      loadingStateManager.showLoading();
      
      // Attempt to preload on demand
      pagePreloader.preloadOnDemand(to).finally(() => {
        navigate(to, options);
        // Hide loading after a short delay
        setTimeout(() => {
          loadingStateManager.hideLoading();
        }, 200);
      });
    }
  }, [navigate]);

  const preloadOnHover = useCallback((path: string) => {
    // Preload route when user hovers over a link
    pagePreloader.preloadOnDemand(path);
  }, []);

  const getPreloadingStatus = useCallback(() => {
    return pagePreloader.getPreloadingStatus();
  }, []);

  return {
    navigate: smartNavigate,
    preloadOnHover,
    getPreloadingStatus,
    isRoutePreloaded: pagePreloader.isRoutePreloaded.bind(pagePreloader)
  };
};

export default useSmartNavigation;
