import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Layout2Contact = () => {
  return (
    <section id="contact" className="py-32 px-6 md:px-12 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Simple centered heading */}
        <div className="text-center space-y-6 mb-20 fade-in">
          <h2 className="text-4xl md:text-6xl font-thin text-foreground tracking-tight">
            Get in Touch
          </h2>
          <div className="w-16 h-px bg-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-12 fade-in-delay-1">
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-light text-foreground mb-6">Let's Talk</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Whether you have questions about our products or need support, 
                  we're here to help you on your hydration journey.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-muted-foreground">hello@myfuze.co.za</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Phone</div>
                    <div className="text-muted-foreground">1-800-PURE-H2O</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Address</div>
                    <div className="text-muted-foreground">Mountain View, CA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="fade-in-delay-2">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input 
                    placeholder="First name"
                    className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 py-4 focus:border-primary"
                  />
                </div>
                <div>
                  <Input 
                    placeholder="Last name"
                    className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 py-4 focus:border-primary"
                  />
                </div>
              </div>
              
              <Input 
                type="email" 
                placeholder="Email address"
                className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 py-4 focus:border-primary"
              />
              
              <Input 
                placeholder="Subject"
                className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 py-4 focus:border-primary"
              />
              
              <Textarea 
                placeholder="Your message..."
                rows={4}
                className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 py-4 focus:border-primary resize-none"
              />
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 font-light group"
                >
                  <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Response time */}
        <div className="text-center mt-16 pt-16 border-t border-border/30 fade-in-delay-3">
          <p className="text-sm text-muted-foreground font-light">
            We typically respond within 24 hours
          </p>
        </div>
      </div>
    </section>
  );
};

export default Layout2Contact;
