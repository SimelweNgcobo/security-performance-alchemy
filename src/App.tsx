import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeGlobalScrollToTop } from "@/hooks/use-scroll-to-top";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Sustainability from "./pages/Sustainability";
import Quality from "./pages/Quality";
import Checkout from "./pages/Checkout";
import Enterprise from "./pages/Enterprise";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import AdminAuth from "./pages/AdminAuth";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize global scroll to top for all button clicks
    initializeGlobalScrollToTop();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/quality" element={<Quality />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route path="/panel-1973" element={<AdminPanel />} />
              <Route path="/panel1973" element={<AdminPanel />} />
              <Route path="/admin" element={<AdminAuth />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
