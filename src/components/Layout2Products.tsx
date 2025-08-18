import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Layout2Products = () => {
  const navigate = useNavigate();

  const handleBulkPurchase = () => {
    navigate('/bulk-checkout');
  };

  const products = [
    {
      name: "Mini Bottle",
      size: "250ml",
      description: "Perfect for on-the-go hydration. Compact design that fits in your pocket or small bag.",
      image: "https://images.pexels.com/photos/3736302/pexels-photo-3736302.jpeg",
      badge: "Portable",
      gradient: "from-blue-500/20 to-blue-600/5",
      volume: "250ml",
      dimensions: "Compact & Lightweight"
    },
    {
      name: "Classic Bottle",
      size: "500ml",
      description: "Our most popular size. Ideal for daily hydration, workouts, and office use.",
      image: "https://images.pexels.com/photos/4068324/pexels-photo-4068324.jpeg",
      badge: "Popular",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      volume: "500ml",
      dimensions: "Standard & Versatile"
    },
    {
      name: "Family Bottle",
      size: "1 litre",
      description: "Perfect for family outings, picnics, and extended activities. Great value for sharing.",
      image: "https://images.pexels.com/photos/6314334/pexels-photo-6314334.jpeg",
      badge: "Family",
      gradient: "from-amber-500/20 to-amber-600/5",
      volume: "1L",
      dimensions: "Family Size"
    },
    {
      name: "Large Bottle",
      size: "1.5 litre",
      description: "Extended hydration for long days. Perfect for sports, hiking, and outdoor adventures.",
      image: "https://images.pexels.com/photos/3736302/pexels-photo-3736302.jpeg",
      badge: "Sports",
      gradient: "from-purple-500/20 to-purple-600/5",
      volume: "1.5L",
      dimensions: "Sports & Outdoor"
    },
    {
      name: "XL Bottle",
      size: "2 litre",
      description: "Maximum hydration capacity. Ideal for all-day events, camping, and group activities.",
      image: "https://images.pexels.com/photos/4068324/pexels-photo-4068324.jpeg",
      badge: "XL",
      gradient: "from-red-500/20 to-red-600/5",
      volume: "2L",
      dimensions: "Extra Large"
    },
    {
      name: "Bulk Bottle",
      size: "5 litre",
      description: "Commercial grade bottle for offices, events, and large gatherings. Perfect for sharing.",
      image: "https://images.pexels.com/photos/6314334/pexels-photo-6314334.jpeg",
      badge: "Commercial",
      gradient: "from-indigo-500/20 to-indigo-600/5",
      volume: "5L",
      dimensions: "Bulk & Commercial"
    }
  ];

  return (
    <section id="products" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-6 sm:space-y-8 mb-16 sm:mb-20 lg:mb-24 fade-in">
          <div className="inline-block">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-tight">
              Our Collection
            </h2>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary font-light mt-2 tracking-wide">
              Six Perfect Sizes
            </div>
          </div>
          <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-light max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
            From portable 250ml bottles to commercial 6-litre containers, discover the perfect size for every hydration need.
          </p>
        </div>

        {/* Products Grid - Mobile First Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {products.map((product, index) => (
            <Card 
              key={index} 
              className={`group border border-primary/10 shadow-lg hover:shadow-2xl bg-gradient-to-br from-background/90 to-primary/5 transition-all duration-500 hover:scale-105 fade-in-delay-${index + 1} overflow-hidden`}
            >
              <CardContent className="p-0 space-y-4 sm:space-y-6">
                {/* Image Section with Triangle Arrangement */}
                <div className="relative overflow-hidden">
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                    <div className={`inline-block bg-gradient-to-r ${product.gradient} border border-primary/20 rounded-full px-2 sm:px-3 py-1`}>
                      <span className="text-xs font-semibold text-primary">{product.badge}</span>
                    </div>
                  </div>

                  {/* Triangle Arrangement of Bottles */}
                  <div className="aspect-[4/3] sm:aspect-[4/4] bg-gradient-to-br from-primary/5 to-primary/10 relative flex items-center justify-center p-4 sm:p-6">
                    {/* Center Bottle (Main) */}
                    <div className="relative z-10 w-16 sm:w-20 lg:w-24 h-20 sm:h-24 lg:h-28 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={product.image}
                        alt={`${product.name} center`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* Left Bottle (Faded) */}
                    <div className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-18 h-16 sm:h-20 lg:h-22 rounded-lg overflow-hidden border border-white shadow-md opacity-60 transform -rotate-12">
                      <img
                        src={product.image}
                        alt={`${product.name} left`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* Right Bottle (Faded) */}
                    <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-18 h-16 sm:h-20 lg:h-22 rounded-lg overflow-hidden border border-white shadow-md opacity-60 transform rotate-12">
                      <img
                        src={product.image}
                        alt={`${product.name} right`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  {/* Title and Size */}
                  <div className="space-y-2 sm:space-y-3 text-center">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 sm:px-4 py-1 rounded-full">
                      {product.size}
                    </div>
                  </div>

                  {/* Volume and Dimensions */}
                  <div className="text-center space-y-2">
                    <div className="text-2xl sm:text-3xl font-light text-primary">{product.volume}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{product.dimensions}</div>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground font-light text-center leading-relaxed">
                    {product.description}
                  </p>

                  {/* Features Badge */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2 sm:pt-4">
                    <Badge variant="outline" className="text-xs">BPA Free</Badge>
                    <Badge variant="outline" className="text-xs">Recyclable</Badge>
                    <Badge variant="outline" className="text-xs">Food Grade</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bulk Purchase Section */}
        <div className="text-center mt-16 sm:mt-20 lg:mt-24 fade-in-delay-3">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl px-8 py-12 border border-primary/20">
            <h3 className="text-2xl sm:text-3xl font-light text-foreground mb-4">
              Need Bulk Quantities?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the best prices for bulk orders. Perfect for events, offices, schools, and commercial use.
              Special pricing tiers available from 10 bottles to 10,000+.
            </p>
            <Button
              onClick={handleBulkPurchase}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Purchase Bulk
            </Button>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="text-center mt-16 sm:mt-20 lg:mt-24 fade-in-delay-4">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl px-6 sm:px-8 py-6 sm:py-4 border border-primary/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-medium text-sm sm:text-base">Premium Quality Materials</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-primary/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-primary font-medium text-sm sm:text-base">Sustainable & Eco-Friendly</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-primary/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <span className="text-primary font-medium text-sm sm:text-base">Custom Branding Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2Products;
