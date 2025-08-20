import { CheckCircle, Users, Globe, Heart } from "lucide-react";

const Layout2About = () => {
  const features = [
    {
      title: "Artisanal Source",
      description: "Hand-selected from the world's most pristine alpine springs, where nature has perfected purity for millennia",
      stat: "100%",
      gradient: "from-blue-500/20 to-blue-600/5"
    },
    {
      title: "Master Filtration",
      description: "Seven-stage artisanal purification process, combining traditional methods with cutting-edge technology",
      stat: "99.9%",
      gradient: "from-emerald-500/20 to-emerald-600/5"
    },
    {
      title: "Earth Conscious",
      description: "Pioneering sustainable practices with carbon-negative operations and regenerative packaging",
      stat: "Zero",
      gradient: "from-green-500/20 to-green-600/5"
    },
    {
      title: "Excellence Standard",
      description: "Unwavering commitment to perfection through continuous quality monitoring and testing",
      stat: "24/7",
      gradient: "from-amber-500/20 to-amber-600/5"
    }
  ];

  const stats = [
    { icon: Users, value: "Endless", label: "Satisfied Customers" },
    { icon: Globe, value: "SA", label: "South Africa Proud" },
    { icon: Heart, value: "99.9%", label: "Purity Guaranteed" },
    { icon: CheckCircle, value: "24/7", label: "Quality Control" }
  ];

  return (
    <section id="about" className="py-32 px-6 md:px-12 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        {/* Sophisticated centered heading */}
        <div className="text-center space-y-8 mb-32 fade-in">
          <div className="inline-block">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight leading-none">
              The MyFuze
            </h2>
            <div className="text-2xl md:text-3xl text-primary font-light mt-2 tracking-wide">
              Philosophy
            </div>
          </div>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          <p className="text-xl text-muted-foreground font-light max-w-4xl mx-auto leading-relaxed">
            We believe that exceptional water is not just a necessity, but an art form. Our philosophy centers on
            the harmonious balance between nature's gifts and human innovation, creating hydration experiences
            that elevate the everyday.
          </p>
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

        {/* Refined call to action */}
        <div className="text-center fade-in-delay-3">
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-3xl md:text-4xl font-light text-foreground leading-tight">
              Elevate Your
              <span className="block text-primary">Hydration Experience</span>
            </h3>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Join a community of discerning individuals who understand that quality matters in every aspect of life.
              Experience the difference that true craftsmanship makes, one sip at a time.
            </p>
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-8 py-4 border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-medium">Crafted for Connoisseurs</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2About;
