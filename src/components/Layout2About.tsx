import { CheckCircle, Users, Globe, Heart } from "lucide-react";

const Layout2About = () => {
  const features = [
    {
      title: "Quality",
      description: "Commitment to producing safe, premium-standard bottled water through advanced purification processes",
      stat: "100%",
      gradient: "from-blue-500/20 to-blue-600/5"
    },
    {
      title: "Integrity",
      description: "Operating with transparency and professionalism in all business dealings, building trust with our customers",
      stat: "2020",
      gradient: "from-emerald-500/20 to-emerald-600/5"
    },
    {
      title: "Sustainability",
      description: "Promoting environmentally responsible production and packaging practices for a better tomorrow",
      stat: "Eco",
      gradient: "from-green-500/20 to-green-600/5"
    },
    {
      title: "Customer Focus",
      description: "Building long-term, value-driven relationships with clients through innovation and excellent service",
      stat: "24/7",
      gradient: "from-amber-500/20 to-amber-600/5"
    }
  ];

  const stats = [
    { icon: Users, value: "Trusted", label: "Customer Partnerships" },
    { icon: Globe, value: "SA", label: "South Africa Based" },
    { icon: Heart, value: "100%", label: "Premium Quality" },
    { icon: CheckCircle, value: "2020", label: "Established Since" }
  ];

  return (
    <section id="about" className="py-32 px-6 md:px-12 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        {/* Company Overview Header */}
        <div className="text-center space-y-8 mb-32 fade-in">
          <div className="inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight leading-none">
              MyFuze Beverages
            </h2>
            <div className="text-2xl md:text-3xl text-primary font-light mt-2 tracking-wide">
              Pure Refreshment Company
            </div>
          </div>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              MyFuze Beverages is a South African bottled water manufacturing company established in 2020. We were founded with the vision of providing consumers with safe, refreshing, and premium-quality drinking water.
            </p>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              With a growing demand for reliable hydration solutions, MyFuze Beverages has positioned itself as a trusted supplier to individuals, businesses, and organizations across multiple sectors.
            </p>
          </div>
        </div>

        {/* Vision and Mission */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="group cursor-pointer fade-in-delay-1">
            <div className="relative p-8 rounded-3xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5 hover:from-primary/5 hover:to-primary/10 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="space-y-4">
                <h3 className="text-3xl font-light text-primary group-hover:text-primary transition-colors duration-300">
                  Our Vision
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  To become a leading and trusted bottled water brand in South Africa and beyond, recognized for quality, sustainability, and customer satisfaction.
                </p>
              </div>
            </div>
          </div>

          <div className="group cursor-pointer fade-in-delay-2">
            <div className="relative p-8 rounded-3xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5 hover:from-primary/5 hover:to-primary/10 transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="space-y-4">
                <h3 className="text-3xl font-light text-primary group-hover:text-primary transition-colors duration-300">
                  Our Mission
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  To provide pure and refreshing bottled water through advanced purification processes, eco-friendly packaging, and efficient distribution channels, while building strong partnerships with customers and communities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-light text-foreground mb-4">Core Values</h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>
        </div>

        {/* Enhanced features grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          {features.map((feature, index) => (
            <div key={index} className={`group cursor-pointer fade-in-delay-${index + 1}`}>
              <div className="relative p-8 rounded-3xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5 hover:from-primary/5 hover:to-primary/10 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="flex items-start space-x-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-xl font-medium text-primary">{feature.stat}</div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Elegant stats section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-primary/5 to-primary/10 p-12 border border-primary/20 mb-24 fade-in-delay-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-light text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Products & Services */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-light text-foreground mb-4">Products & Services</h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                <h4 className="text-xl font-medium text-foreground mb-4">Purified Bottled Water</h4>
                <p className="text-muted-foreground mb-4">Available in various sizes to meet all your hydration needs:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 330ml - Perfect for on-the-go hydration</li>
                  <li>• 500ml - Individual serving size</li>
                  <li>• 750ml - Premium personal bottle</li>
                  <li>• 1.5L - Family size option</li>
                  <li>• 5L - Bulk household supply</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                <h4 className="text-xl font-medium text-foreground mb-4">Custom-Branded Water</h4>
                <p className="text-muted-foreground">
                  Tailored solutions for corporate, hospitality, and events with your custom branding and design.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                <h4 className="text-xl font-medium text-foreground mb-4">Bulk Supply & Distribution</h4>
                <p className="text-muted-foreground">
                  Comprehensive distribution services to retail outlets, wholesalers, and institutions with reliable supply chains.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                <h4 className="text-xl font-medium text-foreground mb-4">Corporate & Hospitality Partnerships</h4>
                <p className="text-muted-foreground">
                  Specialized hydration solutions designed for corporate offices, hospitality venues, and event spaces.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center fade-in-delay-3">
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-3xl md:text-4xl font-light text-foreground leading-tight">
              Experience Pure
              <span className="block text-primary">Refreshment Today</span>
            </h3>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Join thousands of satisfied customers who trust MyFuze Beverages for their hydration needs.
              Quality, sustainability, and customer satisfaction are at the heart of everything we do.
            </p>
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-8 py-4 border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-medium">Trusted Since 2020</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2About;
