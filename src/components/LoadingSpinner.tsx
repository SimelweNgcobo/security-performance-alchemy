import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "md", 
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} mb-3`} />
      {message && (
        <p className="text-sm text-muted-foreground font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
