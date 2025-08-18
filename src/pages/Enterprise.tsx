import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Building2,
  CheckCircle,
  Palette,
  Star,
  Users,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import LabelEditor from "@/components/LabelEditor";

const Enterprise = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);

  useEffect(() => {
    // Load saved designs from localStorage
    const designs = JSON.parse(localStorage.getItem('quoteDesigns') || '[]');
    setSavedDesigns(designs);
  }, []);

  const handleEnterpriseRequest = async () => {
    if (!companyName || !contactEmail) {
      toast.error("Please fill in company name and contact email");
      return;
    }

    setLoading(true);
    try {
      // TODO: Save enterprise request to database when enterprise_requests table is created
      // For now, we'll simulate the request submission

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Enterprise request submitted:", {
        company_name: companyName,
        contact_email: contactEmail,
        requirements: requirements,
        user_id: user?.id || null,
        status: 'pending'
      });

      toast.success("Enterprise request sent successfully! We'll contact you within 24 hours.");

      // Reset form
      setCompanyName("");
      setContactEmail(user?.email || "");
      setRequirements("");
    } catch (error) {
      console.error("Error submitting enterprise request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        {/* Header */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Enterprise Solutions
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Design custom bottle labels with our professional editor. Perfect for corporate events, 
              promotional campaigns, and business partnerships.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Custom Design</h3>
              <p className="text-sm text-muted-foreground">Professional label editor with precise 264mm × 60mm sizing</p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Enterprise Scale</h3>
              <p className="text-sm text-muted-foreground">Bulk orders from 100 to 10,000+ bottles with volume discounts</p>
            </div>
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">Food-grade materials with high-resolution label printing</p>
            </div>
          </div>

          {/* Label Designer Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Professional Label Designer
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create stunning custom labels with our intuitive design tool. Upload your logo, add text, 
                and customize every element to match your brand perfectly.
              </p>
            </div>
            
            {/* Label Editor Component */}
            <LabelEditor />
          </div>

          <Separator className="my-12" />

          {/* Quote Request Section */}
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-primary" />
                    <span>Request Custom Quote</span>
                  </CardTitle>
                  <CardDescription>
                    Get a personalized quote for your enterprise water bottle order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      placeholder="Your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Contact Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Project Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Quantity needed, timeline, special requirements, event details..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Saved Designs Preview */}
                  {savedDesigns.length > 0 && (
                    <div>
                      <Label>Attached Label Designs ({savedDesigns.length})</Label>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedDesigns.map((design, index) => (
                          <div key={design.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Design {index + 1}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(design.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="bg-white border rounded p-2 text-center">
                              <div className="text-xs text-muted-foreground mb-1">
                                {design.dimensions.width}mm × {design.dimensions.height}mm
                              </div>
                              <div className="text-sm">
                                {design.design.elements.length} element(s)
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Background: {design.design.backgroundColor}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        These designs will be included with your quote request for review.
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleEnterpriseRequest}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Sending Request..." : "Send Enterprise Request"}
                  </Button>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>We'll respond within 24 hours with a detailed quote</span>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits & Testimonial */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Why Choose MyFuze Enterprise?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Volume Discounts</h4>
                        <p className="text-sm text-muted-foreground">Significant savings on orders of 500+ bottles</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Fast Turnaround</h4>
                        <p className="text-sm text-muted-foreground">2-3 week production time for custom orders</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Dedicated Support</h4>
                        <p className="text-sm text-muted-foreground">Personal account manager for large projects</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Flexible Delivery</h4>
                        <p className="text-sm text-muted-foreground">Nationwide delivery with tracking</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client Testimonial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-muted-foreground italic">
                      "MyFuze helped us create beautiful custom water bottles for our corporate event. 
                      The label designer was incredibly easy to use, and the quality exceeded our expectations."
                    </blockquote>
                    <div className="mt-3">
                      <div className="font-medium">Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">Event Manager, TechCorp SA</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Enterprise Pricing Tiers
              </h2>
              <p className="text-muted-foreground">
                Transparent pricing with volume discounts for larger orders
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Starter</CardTitle>
                  <div className="text-2xl font-bold text-primary">100-499</div>
                  <CardDescription>bottles</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Perfect for small events and team building</p>
                </CardContent>
              </Card>

              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Business</CardTitle>
                  <div className="text-2xl font-bold text-primary">500-1999</div>
                  <CardDescription>bottles</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Ideal for corporate events and conferences</p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Corporate</CardTitle>
                  <div className="text-2xl font-bold text-primary">2000-4999</div>
                  <CardDescription>bottles</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Great for large events and marketing campaigns</p>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Enterprise</CardTitle>
                  <div className="text-2xl font-bold text-primary">5000+</div>
                  <CardDescription>bottles</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Maximum volume discounts for large organizations</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                All prices include custom label printing and standard packaging. 
                Contact us for detailed pricing based on your specific requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Enterprise;
