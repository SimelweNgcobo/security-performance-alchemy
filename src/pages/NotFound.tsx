import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background pt-20">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Water droplet with error indicator */}
          <div className="mb-8 relative">
            {/* Big red circle with line across (error indicator) */}
            <div className="relative mx-auto mb-6 w-32 h-32 flex items-center justify-center">
              {/* Red circle background */}
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-90"></div>
              
              {/* Water droplet icon */}
              <div className="relative z-10">
                <Droplets className="w-16 h-16 text-white" strokeWidth={2} />
              </div>
              
              {/* Red line across (diagonal) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-1 bg-red-600 rotate-45 rounded-full shadow-lg"></div>
              </div>
            </div>

            {/* Additional water droplet animation */}
            <div className="flex justify-center space-x-2 opacity-60">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* 404 Text */}
          <div className="space-y-4 mb-8">
            <h1 className="text-6xl font-bold text-red-500 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Looks like this page is empty — no water here 💧
            </p>
            <p className="text-md text-muted-foreground">
              The page you're looking for has dried up or never existed.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="px-6 py-3 bg-primary hover:bg-primary/90"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Encouraging message */}
          <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">💧 Stay hydrated!</span> 
              {" "}Find fresh content flowing at our homepage.
            </p>
          </div>
        </div>
      </div>
      
      <Layout2Footer />
    </div>
  );
};

export default NotFound;
