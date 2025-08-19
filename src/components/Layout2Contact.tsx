import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Layout2Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Thank you! Your message has been sent successfully.");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Get in Touch
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have questions about our products or need support? We'd love to hear from you and help you on your wellness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6 fade-in-delay-1">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Send us an email anytime
                    </p>
                    <p className="text-primary font-medium">hello@myfuze.co.za</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Available 9am – 5pm
                    </p>
                    <p className="text-primary font-medium">060-565-4664</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Response Time Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Quick Response</h4>
                    <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 fade-in-delay-2">
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h3>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name *
                      </Label>
                      <Input 
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name *
                      </Label>
                      <Input 
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <Input 
                      id="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </Label>
                    <Textarea 
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className="resize-none"
                      required
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-base group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Your information is secure and will never be shared.</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout2Contact;
