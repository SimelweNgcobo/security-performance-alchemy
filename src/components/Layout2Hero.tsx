import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Play, Circle } from "lucide-react";

const Layout2Hero = () => {
  const [showOurStory, setShowOurStory] = useState(false);

  return (
    <section id="home" className="min-h-screen relative overflow-hidden">
      {/* Sophisticated background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-8 fade-in">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-6 py-3 border border-primary/20">
                <Circle className="w-3 h-3 fill-primary text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Premium Water Collection</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-foreground tracking-tight leading-none">
                <span className="block bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  MyFuze
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl mt-4 text-muted-foreground font-extralight">
                  Refined. Pure. Elevated.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground font-light max-w-xl leading-relaxed">
                Experience hydration redefined through artisanal craftsmanship and nature's finest elements. Each drop tells a story of purity and excellence.
              </p>
            </div>

            {/* Enhanced CTA section */}
            <div className="flex flex-col sm:flex-row items-start gap-6 fade-in-delay-2">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-xl group border-0"
              >
                Discover Collection
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-primary/30 text-primary hover:bg-primary/5 px-12 py-6 text-lg font-medium rounded-full transition-all duration-300 hover:border-primary/50 group"
              >
                <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Our Story
              </Button>
            </div>

            {/* Sophisticated stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/20 fade-in-delay-3">
              <div className="text-center">
                <div className="text-3xl font-light text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground font-medium">Connoisseurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-primary mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground font-medium">Purity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-primary mb-1">15+</div>
                <div className="text-sm text-muted-foreground font-medium">Countries</div>
              </div>
            </div>
          </div>

          {/* Right Content - Premium product showcase */}
          <div className="relative fade-in-delay-1">
            <div className="relative">
              {/* Elegant background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl blur-xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 to-transparent rounded-3xl blur-lg transform -rotate-3"></div>

              {/* Product showcase */}
              <div className="relative bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-sm rounded-3xl p-12 border border-primary/10">
                <img
                  src="https://images.pexels.com/photos/4068324/pexels-photo-4068324.jpeg"
                  alt="MyFuze Premium Water Collection"
                  className="w-full h-auto max-w-md mx-auto drop-shadow-2xl transform hover:scale-105 transition-all duration-700 rounded-2xl"
                />

                {/* Floating quality indicators */}
                <div className="absolute top-8 right-8 bg-primary/90 text-primary-foreground rounded-2xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-xs font-semibold">PREMIUM</div>
                </div>
                <div className="absolute bottom-8 left-8 bg-background/90 border border-primary/20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-primary">★ 4.9 RATED</div>
                </div>
              </div>
            </div>

            {/* Ambient decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-primary/15 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-primary/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2Hero;
