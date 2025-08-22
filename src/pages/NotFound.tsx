import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Water-themed illustration */}
        <div className="mb-8">
          {/* Closed Tap */}
          <div className="relative mx-auto mb-6">
            <svg width="120" height="80" viewBox="0 0 120 80" className="mx-auto">
              {/* Tap body */}
              <rect x="20" y="25" width="80" height="15" rx="7" fill="#6b7280" />
              <rect x="90" y="30" width="15" height="5" rx="2" fill="#6b7280" />
              
              {/* Tap handle (closed position) */}
              <circle cx="105" cy="32.5" r="8" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
              <rect x="102" y="30" width="6" height="5" rx="1" fill="#6b7280" />
              
              {/* Water pipe */}
              <rect x="15" y="15" width="10" height="25" rx="5" fill="#9ca3af" />
              
              {/* X mark to show it's closed */}
              <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <line x1="95" y1="45" x2="115" y2="65" />
                <line x1="115" y1="45" x2="95" y2="65" />
              </g>
            </svg>
          </div>

          {/* Half-full/Half-empty Cup */}
          <div className="relative mx-auto w-20 h-28">
            <svg width="80" height="112" viewBox="0 0 80 112" className="mx-auto">
              {/* Cup outline */}
              <path
                d="M15 15 L15 95 Q15 105 25 105 L55 105 Q65 105 65 95 L65 15 Z"
                fill="none"
                stroke="#6b7280"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Cup rim */}
              <line x1="10" y1="15" x2="70" y2="15" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
              
              {/* Water (half full) */}
              <path
                d="M17 60 L17 93 Q17 100 25 100 L55 100 Q63 100 63 93 L63 60 Z"
                fill="url(#waterGradient)"
              />
              
              {/* Water surface with gentle wave */}
              <path
                d="M17 60 Q25 58 32 60 T47 60 T63 60"
                stroke="#3b82f6"
                strokeWidth="1"
                fill="none"
                className="animate-pulse"
              />
              
              {/* Reflection on glass */}
              <rect x="20" y="20" width="3" height="30" rx="1.5" fill="white" opacity="0.3" />
              
              {/* Define gradient for water */}
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: "#60a5fa", stopOpacity: 0.8}} />
                  <stop offset="100%" style={{stopColor: "#3b82f6", stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Glass reflection effect */}
            <div className="absolute top-4 left-2 w-1 h-8 bg-white opacity-20 rounded-full"></div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-4 mb-8">
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Oops! The Well Ran Dry</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            It looks like the page you're looking for has evaporated. 
            The tap is closed and the glass is only half full, but don't worry – 
            we'll help you find your way back to refreshing content.
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

        {/* Cute message */}
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Tip:</span> Our pure water collection is always flowing at the homepage!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
