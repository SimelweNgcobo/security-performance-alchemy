import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";

const Quality = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 px-6 md:px-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-6xl font-thin text-foreground tracking-tight">
              Uncompromising Quality
            </h1>
            <div className="w-16 h-px bg-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Every drop of MyFuze water meets the highest standards of purity and excellence.
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-light text-foreground text-center">Seven-Stage Purification</h2>
              <p className="text-muted-foreground font-light leading-relaxed text-center max-w-3xl mx-auto">
                Our proprietary purification process combines traditional methods with cutting-edge technology 
                to achieve 99.9% purity while preserving essential minerals.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Source Filtration</h3>
                      <p className="text-muted-foreground font-light">Initial filtration at the alpine spring source removes large particles and sediments.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Carbon Filtration</h3>
                      <p className="text-muted-foreground font-light">Activated carbon removes chlorine, organic compounds, and improves taste.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Reverse Osmosis</h3>
                      <p className="text-muted-foreground font-light">Advanced membrane technology removes 99% of contaminants and impurities.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">UV Sterilization</h3>
                      <p className="text-muted-foreground font-light">Ultraviolet light eliminates bacteria and viruses without chemicals.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Ozonation</h3>
                      <p className="text-muted-foreground font-light">Ozone treatment provides final disinfection while maintaining water freshness.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">6</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Mineral Enhancement</h3>
                      <p className="text-muted-foreground font-light">Essential minerals are carefully reintroduced for optimal taste and health benefits.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-primary">7</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Final Quality Check</h3>
                      <p className="text-muted-foreground font-light">Every batch undergoes rigorous testing before packaging to ensure perfection.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-12 text-center">
              <h3 className="text-2xl font-light text-foreground mb-8">Quality Certifications</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-light text-primary mb-2">ISO 9001</div>
                  <div className="text-sm text-muted-foreground">Quality Management</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-primary mb-2">HACCP</div>
                  <div className="text-sm text-muted-foreground">Food Safety</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-primary mb-2">NSF</div>
                  <div className="text-sm text-muted-foreground">Water Quality</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-primary mb-2">SABS</div>
                  <div className="text-sm text-muted-foreground">South African Standards</div>
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

export default Quality;
