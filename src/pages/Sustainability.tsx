import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";

const Sustainability = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 px-6 md:px-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-6xl font-thin text-foreground tracking-tight">
              Our Commitment to Sustainability
            </h1>
            <div className="w-16 h-px bg-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              We believe in protecting the environment that provides us with nature's finest water.
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-light text-foreground text-center">Carbon-Negative Operations</h2>
              <p className="text-muted-foreground font-light leading-relaxed text-center max-w-3xl mx-auto">
                MyFuze operates with carbon-negative practices, meaning we remove more carbon from the atmosphere than we produce. 
                Our renewable energy systems and reforestation initiatives ensure every bottle of MyFuze contributes to a healthier planet.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-light text-primary">♻</span>
                </div>
                <h3 className="text-xl font-medium text-foreground">Regenerative Packaging</h3>
                <p className="text-muted-foreground font-light">
                  Our bottles are made from 100% recycled materials and are fully recyclable, creating a circular economy.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-light text-primary">🌱</span>
                </div>
                <h3 className="text-xl font-medium text-foreground">Source Protection</h3>
                <p className="text-muted-foreground font-light">
                  We actively protect and restore the alpine springs we source from, ensuring their purity for generations.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-light text-primary">⚡</span>
                </div>
                <h3 className="text-xl font-medium text-foreground">Clean Energy</h3>
                <p className="text-muted-foreground font-light">
                  Our facilities run on 100% renewable energy, powered by solar and wind sources.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-12 text-center">
              <h3 className="text-2xl font-light text-foreground mb-4">Our Environmental Impact</h3>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-light text-primary">-120%</div>
                  <div className="text-sm text-muted-foreground">Carbon Footprint</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Renewable Energy</div>
                </div>
                <div>
                  <div className="text-3xl font-light text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Waste to Landfill</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Sustainability;
