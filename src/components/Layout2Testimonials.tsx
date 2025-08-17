import { Star, Quote } from "lucide-react";

const Layout2Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wellness Coach",
      content: "MyFuze has completely transformed my daily routine. The purity is unmatched.",
      rating: 5,
      location: "California"
    },
    {
      name: "Michael Chen",
      role: "Fitness Trainer", 
      content: "I recommend MyFuze to every client. The quality speaks for itself.",
      rating: 5,
      location: "New York"
    },
    {
      name: "Emma Rodriguez",
      role: "Nutritionist",
      content: "The filtration process is exceptional. You can taste the difference immediately.",
      rating: 5,
      location: "Texas"
    }
  ];

  return (
    <section className="py-32 px-6 md:px-12 bg-gradient-to-b from-background to-primary/3">
      <div className="max-w-4xl mx-auto">
        {/* Simple centered heading */}
        <div className="text-center space-y-6 mb-20 fade-in">
          <h2 className="text-4xl md:text-6xl font-thin text-foreground tracking-tight">
            What People Say
          </h2>
          <div className="w-16 h-px bg-primary mx-auto"></div>
        </div>

        {/* Clean testimonials layout */}
        <div className="space-y-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`max-w-3xl mx-auto text-center space-y-6 fade-in-delay-${index + 1}`}>
              <Quote className="w-8 h-8 text-primary/30 mx-auto" />
              
              <p className="text-xl md:text-2xl font-light text-foreground leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex justify-center space-x-1 my-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <div className="space-y-1">
                <div className="font-medium text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role} • {testimonial.location}
                </div>
              </div>
              
              {index < testimonials.length - 1 && (
                <div className="w-px h-16 bg-border/30 mx-auto mt-16"></div>
              )}
            </div>
          ))}
        </div>

        {/* Simple stats */}
        <div className="text-center mt-24 pt-16 border-t border-border/30 fade-in-delay-3">
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-light text-primary">4.9</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-light text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-light text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Recommend</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2Testimonials;
