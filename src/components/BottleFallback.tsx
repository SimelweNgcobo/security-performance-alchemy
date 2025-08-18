import { Badge } from "@/components/ui/badge";

interface BottleFallbackProps {
  selectedSize: string;
  labelTexture: string | null;
}

const bottleSizes = [
  { id: "250ml", size: "250ml", volume: "Small", dimensions: { width: 56, height: 165 } },
  { id: "500ml", size: "500ml", volume: "Regular", dimensions: { width: 66, height: 210 } },
  { id: "1L", size: "1L", volume: "Large", dimensions: { width: 84, height: 260 } },
  { id: "1.5L", size: "1.5L", volume: "Family", dimensions: { width: 100, height: 300 } },
  { id: "2L", size: "2L", volume: "XL", dimensions: { width: 110, height: 320 } },
  { id: "5L", size: "5L", volume: "Bulk", dimensions: { width: 160, height: 380 } }
];

const BottleFallback = ({ selectedSize, labelTexture }: BottleFallbackProps) => {
  const currentBottle = bottleSizes.find(bottle => bottle.id === selectedSize) || bottleSizes[1];

  // Calculate scale based on bottle size (500ml as base)
  const baseHeight = 210;
  const scale = Math.min(Math.max(currentBottle.dimensions.height / baseHeight, 0.7), 1.8);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center relative">
      {/* Stylized bottle using CSS */}
      <div className="relative flex flex-col items-center">
        <div
          className="relative transition-all duration-700 ease-in-out"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Bottle Cap */}
          <div className="w-8 h-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-sm mx-auto shadow-md mb-1">
            <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-sm opacity-80"></div>
          </div>

          {/* Bottle Neck */}
          <div className="w-6 h-6 bg-gradient-to-r from-cyan-100 via-white to-cyan-100 border border-cyan-200/50 mx-auto mb-1"></div>

          {/* Main Bottle Body */}
          <div className="relative w-16 h-20 bg-gradient-to-r from-cyan-50 via-white to-cyan-50 rounded-b-2xl shadow-lg border border-cyan-100/30 mx-auto">
            {/* Water inside */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-cyan-300/60 to-cyan-500/80 rounded-b-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/40 via-cyan-100/60 to-white/40"></div>
            </div>

            {/* Label overlay */}
            {labelTexture && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-6 rounded shadow-sm overflow-hidden">
                <img
                  src={labelTexture}
                  alt="Label preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Highlight */}
            <div className="absolute left-1 top-2 w-2 h-12 bg-gradient-to-b from-white/70 via-white/40 to-white/20 rounded-full blur-sm"></div>
          </div>
        </div>

        {/* Size indicator */}
        <Badge variant="secondary" className="mt-4 bg-white/90 backdrop-blur-sm">
          {currentBottle.size} - {currentBottle.volume}
        </Badge>

        {/* Info message */}
        <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
          Interactive bottle preview • Changes reflect in real-time
        </p>
      </div>
    </div>
  );
};

export default BottleFallback;
