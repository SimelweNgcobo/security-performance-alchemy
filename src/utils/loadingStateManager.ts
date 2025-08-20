// Loading state manager to control loading animations
// Prevents constant loading animations after initial app load

interface LoadingState {
  isInitialLoad: boolean;
  showLoadingAnimations: boolean;
  navigationCount: number;
  lastNavigationTime: number;
}

class LoadingStateManager {
  private state: LoadingState = {
    isInitialLoad: true,
    showLoadingAnimations: true,
    navigationCount: 0,
    lastNavigationTime: 0
  };

  private listeners: Set<(state: LoadingState) => void> = new Set();

  /**
   * Initialize the loading state manager
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    // Mark as no longer initial load after first interaction
    const markAsNotInitial = () => {
      if (this.state.isInitialLoad) {
        this.updateState({
          isInitialLoad: false,
          showLoadingAnimations: false
        });
      }
    };

    // Set up event listeners for various user interactions
    const events = ['click', 'scroll', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, markAsNotInitial, { once: true, passive: true });
    });

    // Also mark as not initial after a short delay
    setTimeout(markAsNotInitial, 2000);
  }

  /**
   * Track navigation events
   */
  onNavigation(path: string): void {
    const now = Date.now();
    const timeSinceLastNav = now - this.state.lastNavigationTime;

    this.updateState({
      navigationCount: this.state.navigationCount + 1,
      lastNavigationTime: now,
      // Show loading only if it's been a while since last navigation
      // or if it's the very first navigation
      showLoadingAnimations: this.state.navigationCount === 0 || timeSinceLastNav > 5000
    });

    // Auto-hide loading animations after more navigations
    if (this.state.navigationCount > 3) {
      setTimeout(() => {
        this.updateState({ showLoadingAnimations: false });
      }, 100);
    }
  }

  /**
   * Force show loading animations (for specific cases)
   */
  showLoading(): void {
    this.updateState({ showLoadingAnimations: true });
  }

  /**
   * Force hide loading animations
   */
  hideLoading(): void {
    this.updateState({ showLoadingAnimations: false });
  }

  /**
   * Check if we should show loading animations
   */
  shouldShowLoading(): boolean {
    return this.state.showLoadingAnimations;
  }

  /**
   * Check if this is the initial app load
   */
  isInitialLoad(): boolean {
    return this.state.isInitialLoad;
  }

  /**
   * Get current state
   */
  getState(): LoadingState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: LoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<LoadingState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Reset to initial state (for testing)
   */
  reset(): void {
    this.state = {
      isInitialLoad: true,
      showLoadingAnimations: true,
      navigationCount: 0,
      lastNavigationTime: 0
    };
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Create singleton instance
export const loadingStateManager = new LoadingStateManager();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  loadingStateManager.initialize();
}

export default loadingStateManager;
