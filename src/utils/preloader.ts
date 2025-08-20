// Page preloader utility for instant navigation
// Preloads components and data for faster page transitions

interface PreloadedRoute {
  path: string;
  component: React.ComponentType<any>;
  loaded: boolean;
  loading: boolean;
}

class PagePreloader {
  private preloadedRoutes: Map<string, PreloadedRoute> = new Map();
  private preloadPromises: Map<string, Promise<any>> = new Map();
  private isPreloading = false;

  // Main routes to preload
  private routesToPreload = [
    { path: '/', importFn: () => import('@/pages/Index') },
    { path: '/about', importFn: () => import('@/pages/About') },
    { path: '/contact', importFn: () => import('@/pages/Contact') },
    { path: '/products', importFn: () => import('@/pages/Products') },
    { path: '/enterprise', importFn: () => import('@/pages/Enterprise') },
    { path: '/profile', importFn: () => import('@/pages/Profile') },
    { path: '/faq', importFn: () => import('@/pages/FAQ') },
    { path: '/bulk-checkout', importFn: () => import('@/pages/BulkCheckout') },
    { path: '/auth', importFn: () => import('@/pages/Auth') }
  ];

  /**
   * Start preloading all main pages in the background
   */
  async startPreloading(): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    console.log('🚀 Starting page preloading...');

    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.preloadRoutes();
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadRoutes();
      }, 100);
    }
  }

  /**
   * Preload specific routes
   */
  private async preloadRoutes(): Promise<void> {
    const preloadPromises = this.routesToPreload.map(route => this.preloadRoute(route));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log('✅ Page preloading completed');
    } catch (error) {
      console.warn('⚠️ Some pages failed to preload:', error);
    }
  }

  /**
   * Preload a specific route
   */
  private async preloadRoute(route: { path: string; importFn: () => Promise<any> }): Promise<void> {
    if (this.preloadedRoutes.has(route.path)) {
      return; // Already preloaded or loading
    }

    // Mark as loading
    this.preloadedRoutes.set(route.path, {
      path: route.path,
      component: null as any,
      loaded: false,
      loading: true
    });

    try {
      const componentModule = await route.importFn();
      const component = componentModule.default;

      // Update preloaded route
      this.preloadedRoutes.set(route.path, {
        path: route.path,
        component,
        loaded: true,
        loading: false
      });

      console.log(`📄 Preloaded: ${route.path}`);
    } catch (error) {
      console.warn(`❌ Failed to preload ${route.path}:`, error);
      this.preloadedRoutes.delete(route.path);
    }
  }

  /**
   * Check if a route is preloaded
   */
  isRoutePreloaded(path: string): boolean {
    const route = this.preloadedRoutes.get(path);
    return route?.loaded || false;
  }

  /**
   * Get preloaded component for a route
   */
  getPreloadedComponent(path: string): React.ComponentType<any> | null {
    const route = this.preloadedRoutes.get(path);
    return route?.loaded ? route.component : null;
  }

  /**
   * Preload a single route on demand (for hover preloading)
   */
  async preloadOnDemand(path: string): Promise<void> {
    const route = this.routesToPreload.find(r => r.path === path);
    if (!route || this.preloadedRoutes.has(path)) {
      return;
    }

    await this.preloadRoute(route);
  }

  /**
   * Get preloading status
   */
  getPreloadingStatus(): { total: number; loaded: number; loading: number } {
    const routes = Array.from(this.preloadedRoutes.values());
    return {
      total: this.routesToPreload.length,
      loaded: routes.filter(r => r.loaded).length,
      loading: routes.filter(r => r.loading).length
    };
  }

  /**
   * Clear preloaded routes (for testing or memory management)
   */
  clearPreloadedRoutes(): void {
    this.preloadedRoutes.clear();
    this.preloadPromises.clear();
    this.isPreloading = false;
  }
}

// Create singleton instance
export const pagePreloader = new PagePreloader();

// Auto-start preloading after initial page load
if (typeof window !== 'undefined') {
  // Wait for the initial page to load before starting preloading
  if (document.readyState === 'complete') {
    pagePreloader.startPreloading();
  } else {
    window.addEventListener('load', () => {
      // Small delay to ensure the main page is fully rendered
      setTimeout(() => {
        pagePreloader.startPreloading();
      }, 500);
    });
  }
}

export default pagePreloader;
