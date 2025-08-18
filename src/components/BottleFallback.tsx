import { Badge } from "@/components/ui/badge";
import { Droplets } from "lucide-react";

interface BottleFallbackProps {
  selectedSize: string;
  labelTexture: string | null;
}

const bottleSizes = [
  { id: "250ml", size: "250ml", volume: "Small", dimensions: { width: 60, height: 120 } },
  { id: "500ml", size: "500ml", volume: "Regular", dimensions: { width: 70, height: 160 } },
  { id: "1L", size: "1L", volume: "Large", dimensions: { width: 80, height: 200 } },
  { id: "1.5L", size: "1.5L", volume: "Family", dimensions: { width: 90, height: 240 } },
  { id: "2L", size: "2L", volume: "XL", dimensions: { width: 100, height: 280 } },
  { id: "5L", size: "5L", volume: "Bulk", dimensions: { width: 140, height: 320 } }
];

const BottleFallback = ({ selectedSize, labelTexture }: BottleFallbackProps) => {
  const currentBottle = bottleSizes.find(bottle => bottle.id === selectedSize) || bottleSizes[1];

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center relative">
      {/* Simple bottle illustration */}
      <div className="relative flex flex-col items-center">
        {/* Bottle icon with size scaling */}
        <div 
          className="relative transition-all duration-500 ease-in-out"
          style={{
            transform: `scale(${0.8 + (currentBottle.dimensions.height / 320) * 0.4})`
          }}
        >
          <Droplets className="w-16 h-20 text-blue-500/70" />
          
          {/* Label overlay */}
          {labelTexture && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-6 rounded opacity-80">
              <img
                src={labelTexture}
                alt="Label preview"
                className="w-full h-full object-contain rounded"
              />
            </div>
          )}
        </div>
        
        {/* Size indicator */}
        <Badge variant="secondary" className="mt-4 bg-white/90 backdrop-blur-sm">
          {currentBottle.size} - {currentBottle.volume}
        </Badge>
        
        {/* Fallback message */}
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
          3D preview unavailable. Your customization will be applied to the actual bottle.
        </p>
      </div>
    </div>
  );
};

export default BottleFallback;
