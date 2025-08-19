import { Badge } from "@/components/ui/badge";

interface BottleFallbackProps {
  selectedSize: string;
  labelTexture: string | null;
}

const bottleSizes = [
  { id: "500ml", size: "500ml", volume: "Regular", dimensions: { width: 66, height: 210 } },
  { id: "1L", size: "1L", volume: "Large", dimensions: { width: 84, height: 260 } },
  { id: "1.5L", size: "1.5L", volume: "Family", dimensions: { width: 100, height: 300 } },
  { id: "2L", size: "2L", volume: "XL", dimensions: { width: 110, height: 320 } },
  { id: "5L", size: "5L", volume: "Bulk", dimensions: { width: 160, height: 380 } }
];

const BottleFallback = ({ selectedSize, labelTexture }: BottleFallbackProps) => {
  const currentBottle = bottleSizes.find(bottle => bottle.id === selectedSize) || bottleSizes[1];
  
  // Calculate scale based on bottle size (500ml as base) - increased base scale
  const baseHeight = 210;
  const scale = Math.min(Math.max(currentBottle.dimensions.height / baseHeight, 1.0), 2.5);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center relative">
      {/* Professional studio background */}
      <div className="absolute inset-0 bg-gradient-radial from-white/30 via-transparent to-slate-200/20"></div>
      
      {/* Professional PET bottle design */}
      <div className="relative flex flex-col items-center drop-shadow-2xl">
        <div
          className="relative transition-all duration-700 ease-in-out filter drop-shadow-lg hover:drop-shadow-xl group animate-pulse"
          style={{
            transform: `scale(${scale})`
          }}
        >
          {/* Bottle Cap - Professional threading and texture */}
          <div className="w-9 h-4 mx-auto relative mb-1">
            {/* Cap body with professional ridges */}
            <div className="w-full h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-sm shadow-lg relative overflow-hidden">
              {/* Threading ridges */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10"></div>
              <div className="absolute left-1 top-0 w-0.5 h-full bg-slate-500 opacity-60"></div>
              <div className="absolute left-2.5 top-0 w-0.5 h-full bg-slate-500 opacity-60"></div>
              <div className="absolute left-4 top-0 w-0.5 h-full bg-slate-500 opacity-60"></div>
              <div className="absolute right-1 top-0 w-0.5 h-full bg-slate-500 opacity-60"></div>
              <div className="absolute right-2.5 top-0 w-0.5 h-full bg-slate-500 opacity-60"></div>
            </div>
            {/* Cap highlight */}
            <div className="absolute top-0 left-1 w-2 h-1 bg-gradient-to-r from-white/40 to-transparent rounded-sm"></div>
          </div>
          
          {/* Bottle Neck with threading */}
          <div className="w-7 h-8 mx-auto relative mb-1">
            <div className="w-full h-full bg-gradient-to-r from-slate-100/80 via-white/90 to-slate-100/80 border border-slate-200/40 shadow-inner relative rounded-sm">
              {/* Threading lines */}
              <div className="absolute top-1 left-0 w-full h-0.5 bg-slate-300/30"></div>
              <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-300/30"></div>
              <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-300/30"></div>
              {/* Neck highlight */}
              <div className="absolute left-0.5 top-0 w-1.5 h-full bg-gradient-to-r from-white/50 to-transparent"></div>
            </div>
          </div>
          
          {/* Main Bottle Body - Professional PET design */}
          <div className="relative w-24 h-32 mx-auto">
            {/* Bottle outline with realistic curves */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/40 via-white/60 to-slate-50/40 rounded-3xl shadow-2xl border border-slate-200/20 backdrop-blur-sm">
              {/* Professional transparency effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-slate-100/10 rounded-3xl"></div>
              
              {/* Main highlight - left side */}
              <div className="absolute left-1 top-4 w-3 h-16 bg-gradient-to-b from-white/60 via-white/30 to-white/10 rounded-full blur-sm"></div>
              
              {/* Secondary highlight - right edge */}
              <div className="absolute right-0.5 top-6 w-1 h-12 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
              
              {/* Bottom curve highlight */}
              <div className="absolute bottom-2 left-2 right-2 h-2 bg-gradient-to-t from-white/30 to-transparent rounded-full blur-sm"></div>
            </div>
            
            {/* Water inside - realistic fluid effect */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-gradient-to-t from-blue-400/40 via-blue-300/30 to-blue-200/20 rounded-2xl overflow-hidden">
              {/* Water surface */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-100/60 via-white/40 to-blue-100/60"></div>
              {/* Water depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-300/10 to-blue-500/20 rounded-2xl"></div>
              {/* Water highlight */}
              <div className="absolute left-1 top-2 w-2 h-12 bg-gradient-to-b from-white/20 via-blue-100/15 to-transparent rounded-full blur-sm"></div>
            </div>
            
            {/* Label area - professional application */}
            {labelTexture && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-10 rounded-lg overflow-hidden shadow-xl">
                {/* Label shadow on bottle surface */}
                <div className="absolute inset-0 bg-black/8 blur-sm transform translate-x-0.5 translate-y-0.5 rounded-lg"></div>

                {/* Label adhesion effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 via-transparent to-slate-300/10 rounded-lg"></div>

                {/* Actual label with professional finish */}
                <div className="relative w-full h-full bg-white/95 rounded-lg border border-slate-100/60 overflow-hidden backdrop-blur-sm">
                  <img
                    src={labelTexture}
                    alt="Label preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Premium label coating effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                  {/* Edge definition */}
                  <div className="absolute inset-0 border border-white/30 rounded-lg"></div>
                </div>
              </div>
            )}

            {/* Environmental reflections - premium effect */}
            <div className="absolute top-3 left-2 w-1 h-8 bg-gradient-to-b from-white/40 via-white/20 to-transparent rounded-full blur-sm"></div>
            <div className="absolute top-8 right-3 w-0.5 h-4 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
            
            {/* Bottle base ring */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-gradient-to-t from-slate-300/30 to-transparent rounded-full"></div>
          </div>
        </div>
        
        {/* Professional shadow */}
        <div 
          className="absolute bottom-0 bg-black/10 rounded-full blur-lg"
          style={{ 
            width: `${80 * scale}px`, 
            height: `${8 * scale}px`,
            transform: `translateY(${10 * scale}px)`
          }}
        ></div>
        
        {/* Size indicator with professional styling */}
        <Badge variant="secondary" className="mt-6 bg-white/95 backdrop-blur-sm shadow-sm border border-slate-200/50">
          <span className="text-slate-700 font-medium">{currentBottle.size}</span>
          <span className="text-slate-500 ml-1">• {currentBottle.volume}</span>
        </Badge>
        
        {/* Professional description */}
        <p className="text-xs text-slate-500 mt-2 text-center max-w-xs font-medium">
          Professional PET Bottle Mockup • Real-time Preview
        </p>
      </div>
    </div>
  );
};

export default BottleFallback;
