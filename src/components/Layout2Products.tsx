import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";

const Layout2Products = () => {
  const products = [
    {
      name: "Artisan Glass",
      size: "500ml",
      price: "$24.99",
      description: "Hand-blown glass vessel with alpine spring water, crafted for the discerning palate",
      rating: 4.9,
      image: "https://images.pexels.com/photos/3736302/pexels-photo-3736302.jpeg",
      badge: "Signature",
      gradient: "from-blue-500/20 to-blue-600/5"
    },
    {
      name: "Crystal Reserve",
      size: "750ml",
      price: "$32.99",
      description: "Premium crystal bottle featuring our finest mountain spring collection",
      rating: 4.8,
      image: "https://images.pexels.com/photos/4068324/pexels-photo-4068324.jpeg",
      badge: "Premium",
      gradient: "from-emerald-500/20 to-emerald-600/5"
    },
    {
      name: "Heritage Collection",
      size: "1L",
      price: "$42.99",
      description: "Limited edition heritage bottle with artisanal filtration and elegant presentation",
      rating: 5.0,
      image: "https://images.pexels.com/photos/6314334/pexels-photo-6314334.jpeg",
      badge: "Limited",
      gradient: "from-amber-500/20 to-amber-600/5"
    }
  ];

  return (
    <section id="products" className="py-32 px-6 md:px-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8 mb-24 fade-in">
          <div className="inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight">
              Curated
            </h2>
            <div className="text-2xl md:text-3xl text-primary font-light mt-2 tracking-wide">
              Collection
            </div>
          </div>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed">
            Each piece in our collection represents the pinnacle of hydration artistry,
            where function meets form in perfect harmony.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {products.map((product, index) => (
            <Card key={index} className={`border border-primary/10 shadow-lg hover:shadow-2xl bg-gradient-to-br from-background/90 to-primary/5 group transition-all duration-500 hover:scale-105 fade-in-delay-${index + 1}`}>
              <CardContent className="p-0 space-y-6">
                <div className="relative overflow-hidden rounded-t-xl">
                  <div className="absolute top-4 left-4 z-20">
                    <div className={`inline-block bg-gradient-to-r ${product.gradient} border border-primary/20 rounded-full px-3 py-1`}>
                      <span className="text-xs font-semibold text-primary">{product.badge}</span>
                    </div>
                  </div>

                  <div className="aspect-[4/5] bg-gradient-to-br from-primary/5 to-primary/10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-3 text-center">
                    <h3 className="text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="inline-block bg-primary/10 text-primary text-sm font-medium px-4 py-1 rounded-full">
                      {product.size}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(Math.floor(product.rating))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  </div>

                  <p className="text-muted-foreground font-light text-center leading-relaxed">
                    {product.description}
                  </p>

                  <div className="space-y-6 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-light text-primary">{product.price}</div>
                      <div className="text-xs text-muted-foreground mt-1">Includes premium packaging</div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full py-6 font-medium group transition-all duration-300 hover:shadow-lg border-0">
                      <ShoppingCart className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                      Add to Collection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-24 fade-in-delay-3">
          <div className="inline-flex items-center space-x-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-8 py-4 border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-primary font-medium">Complimentary white-glove delivery</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <span className="text-primary font-medium">30-day satisfaction guarantee</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2Products;
