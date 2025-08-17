import Navbar from "@/components/Navbar";

const Shipping = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-6xl font-thin text-foreground tracking-tight">
              Shipping Information
            </h1>
            <div className="w-16 h-px bg-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Learn about our premium delivery service and shipping options.
            </p>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-foreground">Delivery Options</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 rounded-3xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                  <h3 className="text-lg font-medium text-foreground mb-3">White-Glove Delivery</h3>
                  <p className="text-muted-foreground font-light mb-4">Premium delivery service with careful handling and setup.</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 3-5 business days</li>
                    <li>• Complimentary for orders over R500</li>
                    <li>• Available throughout South Africa</li>
                  </ul>
                </div>
                <div className="p-6 rounded-3xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                  <h3 className="text-lg font-medium text-foreground mb-3">Express Delivery</h3>
                  <p className="text-muted-foreground font-light mb-4">Fast shipping for urgent orders.</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 1-2 business days</li>
                    <li>• R150 shipping fee</li>
                    <li>• Major cities only</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-light text-foreground">Shipping Zones</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border/20">
                  <span className="font-medium text-foreground">Major Cities (Cape Town, Johannesburg, Durban)</span>
                  <span className="text-muted-foreground">1-3 business days</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/20">
                  <span className="font-medium text-foreground">Other Urban Areas</span>
                  <span className="text-muted-foreground">3-5 business days</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/20">
                  <span className="font-medium text-foreground">Rural Areas</span>
                  <span className="text-muted-foreground">5-7 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
