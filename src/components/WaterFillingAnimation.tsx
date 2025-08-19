import { useEffect, useState } from "react";

const WaterFillingAnimation = ({ className = "" }: { className?: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Tap */}
      <div className="relative mb-2">
        <svg width="60" height="40" viewBox="0 0 60 40" className="text-gray-400">
          {/* Tap body */}
          <rect x="10" y="15" width="40" height="8" rx="4" fill="currentColor" />
          <rect x="45" y="18" width="8" height="2" rx="1" fill="currentColor" />
          
          {/* Water drop animation */}
          <circle
            cx="30"
            cy="28"
            r="2"
            fill="#3b82f6"
            className="water-drop-animation"
          />
        </svg>
      </div>

      {/* Glass */}
      <div className="relative w-20 h-24 border-2 border-gray-300 rounded-b-lg bg-transparent overflow-hidden">
        {/* Water fill */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-100 ease-out"
          style={{
            height: `${progress}%`,
            boxShadow: "0 -2px 4px rgba(59, 130, 246, 0.3)"
          }}
        >
          {/* Water surface animation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 opacity-70">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Glass rim */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300 rounded-t-sm"></div>
        
        {/* Reflection effect */}
        <div className="absolute top-2 left-1 w-1 h-8 bg-white opacity-30 rounded-full"></div>
      </div>

      {/* Loading text */}
      <p className="text-sm text-muted-foreground mt-3 animate-pulse">
        Loading your profile...
      </p>
    </div>
  );
};

export default WaterFillingAnimation;
