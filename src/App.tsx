import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { initializeGlobalScrollToTop } from "@/hooks/use-scroll-to-top";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { orderTrackingService } from "@/services/orderTracking";
import LoadingSpinner from "@/components/LoadingSpinner";
import SmartLoadingSpinner from "@/components/SmartLoadingSpinner";
import { pagePreloader } from "@/utils/preloader";
import { loadingStateManager } from "@/utils/loadingStateManager";
import EmailVerificationHandler from "@/components/EmailVerificationHandler";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Quality = lazy(() => import("./pages/Quality"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const BulkCheckout = lazy(() => import("./pages/BulkCheckout"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Page loading fallback component with smart loading
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <SmartLoadingSpinner message="Loading page..." size="lg" />
  </div>
);

// Navigation tracker component to track route changes
const NavigationTracker = () => {
  const location = useLocation();

  useEffect(() => {
    loadingStateManager.onNavigation(location.pathname);
  }, [location]);

  return null;
};

const App = () => {
  useEffect(() => {
    // Initialize global scroll to top for all button clicks
    initializeGlobalScrollToTop();

    // Start page preloading for instant navigation
    pagePreloader.startPreloading();

    // Initialize loading state manager
    loadingStateManager.initialize();

    // App initialization complete
    console.log('🚀 MyFuze App initialized with preloading');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NavigationTracker />
              <EmailVerificationHandler />
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/signup" element={<Auth />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/enterprise" element={<Enterprise />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/bulk-checkout" element={<BulkCheckout />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/sustainability" element={<Sustainability />} />
                  <Route path="/quality" element={<Quality />} />
                  <Route path="/admin-auth" element={<AdminAuth />} />
                  <Route path="/panel-1973" element={<AdminPanel />} />
                  <Route path="/panel1973" element={<AdminPanel />} />
                  <Route path="/admin" element={<Auth />} />
                  <Route path="/admin-panel" element={<AdminPanel />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
