import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Building2,
  CheckCircle,
  Palette,
  Star,
  Users,
  Award,
  ShoppingCart,
  RefreshCw,
  Tag,
  User,
  Eye,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { userLabelsService, UserLabel } from "@/services/userLabels";
import { emailService } from "@/services/emailService";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import LabelEditor from "@/components/LabelEditor";

const Enterprise = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [profileLabels, setProfileLabels] = useState<UserLabel[]>([]);
  const [defaultLabel, setDefaultLabel] = useState<UserLabel | null>(null);
  const [loadingLabels, setLoadingLabels] = useState(false);

  useEffect(() => {
    // Load saved designs from localStorage
    const designs = JSON.parse(localStorage.getItem('quoteDesigns') || '[]');
    setSavedDesigns(designs);

    // Load user labels from Supabase if user is logged in
    if (user?.id) {
      loadUserLabels();
    }
  }, [user]);

  const loadUserLabels = async () => {
    if (!user?.id) return;

    setLoadingLabels(true);
    try {
      const [labels, defaultLabelData] = await Promise.all([
        userLabelsService.getUserLabels(user.id),
        userLabelsService.getDefaultLabel(user.id)
      ]);

      setProfileLabels(labels);
      setDefaultLabel(defaultLabelData);

      // If no labels exist, create a default one
      if (labels.length === 0) {
        const newDefaultLabel = await userLabelsService.createDefaultMyFuzeLabel(user.id);
        if (newDefaultLabel) {
          setProfileLabels([newDefaultLabel]);
          setDefaultLabel(newDefaultLabel);
        }
      }
    } catch (error) {
      console.error('Error loading user labels:', error);
    } finally {
      setLoadingLabels(false);
    }
  };

  const handleEnterpriseRequest = async () => {
    if (!companyName || !contactEmail) {
      toast.error("Please fill in company name and contact email");
      return;
    }

    setLoading(true);
    try {
      // Save enterprise request to database
      const requestData = {
        company_name: companyName,
        contact_email: contactEmail,
        requirements: requirements,
        user_id: user?.id || null,
        status: 'pending',
        designs: savedDesigns.length > 0 ? savedDesigns : null
      };

      const { data, error } = await supabase
        .from('enterprise_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Enterprise request sent successfully! We'll contact you within 24 hours.");

      // Trigger email automation
      if (data) {
        // Send confirmation email to user
        await emailService.triggerQuoteEmailAutomation(data.id);

        // Notify admin about new request
        await emailService.notifyAdminNewRequest(data.id);
      }

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

  const useDefaultLabel = () => {
    if (!defaultLabel) {
      toast.error("No default label found. Please set a default label in your profile.");
      return;
    }

    setRequirements(
      `Using Default Label: "${defaultLabel.name}"\n` +
      `${defaultLabel.description || ''}\n\n` +
      `Design elements: ${defaultLabel.design_data.elements?.length || 0} elements\n` +
      `Background: ${defaultLabel.design_data.backgroundColor || '#ffffff'}`
    );

    // Add to saved designs for the quote
    const exportedLabel = userLabelsService.exportLabelForQuote(defaultLabel);
    setSavedDesigns(prev => {
      const existing = prev.find(d => d.id === exportedLabel.id);
      if (!existing) {
        return [...prev, exportedLabel];
      }
      return prev;
    });

    toast.success(`Default label "${defaultLabel.name}" loaded successfully!`);
  };

  const useMyViews = () => {
    if (!user) {
      toast.error("Please sign in to access your saved labels");
      navigate('/auth');
      return;
    }

    if (profileLabels.length === 0) {
      toast.error("No saved labels found. Create and save labels first.");
      return;
    }

    // Redirect to bulk checkout with user's labels
    navigate('/bulk-checkout', {
      state: {
        userLabels: profileLabels,
        preSelectedDesigns: profileLabels.map(label => userLabelsService.exportLabelForQuote(label))
      }
    });

    toast.success("Redirecting to checkout with your saved labels...");
  };

  const loadLabelFromProfile = (label: UserLabel) => {
    setRequirements(prev =>
      prev + (prev ? '\n\n' : '') +
      `Custom Label: "${label.name}"\n${label.description || ''}\n` +
      `Elements: ${label.design_data.elements?.length || 0} design elements`
    );

    // Add to saved designs
    const exportedLabel = userLabelsService.exportLabelForQuote(label);
    setSavedDesigns(prev => {
      const existing = prev.find(d => d.id === exportedLabel.id);
      if (!existing) {
        return [...prev, exportedLabel];
      }
      return prev;
    });

    toast.success(`Label "${label.name}" loaded from profile`);
  };

  const resetToDefaultBranding = () => {
    setRequirements("Please use MyFuze default branding for this order.");
    setSavedDesigns([]);
    toast.success("Reset to default branding");
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

          {/* Enterprise Actions Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Quick Enterprise Actions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose how you want to proceed with your enterprise order
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Use Default Label */}
              <Card className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Use Default</CardTitle>
                  <CardDescription>
                    {defaultLabel ? `"${defaultLabel.name}"` : 'MyFuze Default Branding'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {defaultLabel && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-gray-700">{defaultLabel.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {defaultLabel.design_data.elements?.length || 0} elements
                      </Badge>
                    </div>
                  )}
                  {profileLabels.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Select from your labels:</p>
                      <div className="space-y-1">
                        {profileLabels.map((label) => (
                          <Button
                            key={label.id}
                            onClick={() => selectLabel(label)}
                            variant={label.is_default ? "default" : "outline"}
                            className="w-full text-left justify-start h-auto p-3"
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{label.name}</span>
                                {label.is_default && <Star className="h-3 w-3 text-yellow-500" />}
                              </div>
                              {label.description && (
                                <p className="text-xs text-muted-foreground mt-1 text-left">{label.description}</p>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => navigate('/profile?tab=labels')}
                      variant="outline"
                      className="w-full"
                      disabled={loadingLabels}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      {loadingLabels ? 'Loading...' : 'Create Labels in Profile'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Use My Views */}
              <Card className="relative group hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Use My Views</CardTitle>
                  <CardDescription>
                    {profileLabels.length} saved label{profileLabels.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {profileLabels.length > 0 ? (
                    <div className="mb-4 space-y-2">
                      {profileLabels.slice(0, 2).map((label) => (
                        <div key={label.id} className="p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">{label.name}</span>
                          {label.is_default && (
                            <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                          )}
                        </div>
                      ))}
                      {profileLabels.length > 2 && (
                        <p className="text-xs text-gray-500">+{profileLabels.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">No saved labels yet</p>
                  )}
                  <Button
                    onClick={useMyViews}
                    className="w-full"
                    disabled={loadingLabels}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {profileLabels.length > 0 ? 'Proceed to Checkout' : 'Create Labels First'}
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Purchase */}
              <Card className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Bulk Purchase</CardTitle>
                  <CardDescription>
                    Standard bottles with volume discounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium text-gray-700">Skip custom design</p>
                    <p className="text-gray-600">Fast processing</p>
                  </div>
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please sign in to access bulk purchasing");
                        navigate('/auth');
                        return;
                      }
                      navigate('/bulk-checkout');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Start Bulk Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Label Design Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Custom Label Design
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create your own label design in your profile. Design stunning custom labels with our intuitive design tool,
                then use them for your enterprise orders.
              </p>
            </div>

            {/* Profile Redirect Card */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Label Design Studio</CardTitle>
                <CardDescription>
                  Access our professional label editor in your profile to create custom designs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">Create</h4>
                    <p className="text-xs text-muted-foreground">Design labels in your profile</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">Save</h4>
                    <p className="text-xs text-muted-foreground">Set as default for orders</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">Use</h4>
                    <p className="text-xs text-muted-foreground">Apply to enterprise orders</p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please sign in to access label design");
                        navigate('/auth');
                        return;
                      }
                      navigate('/profile', { state: { openTab: 'labels' } });
                      toast.success("Redirecting to your profile label designer...");
                    }}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Go to Label Design Studio
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Design 264mm × 60mm labels with professional tools, save multiple designs,
                    and set your favorites as defaults for quick ordering.
                  </p>
                </div>
              </CardContent>
            </Card>
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

                    {/* Profile Labels and Default Branding Options */}
                    <div className="space-y-2 mt-2">
                      {profileLabels.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Your Saved Labels:</Label>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {profileLabels.map((label) => (
                              <Button
                                key={label.id}
                                variant="outline"
                                size="sm"
                                onClick={() => loadLabelFromProfile(label)}
                                className="text-xs"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {label.name}
                                {label.is_default && (
                                  <Badge variant="secondary" className="ml-1 text-xs px-1">Default</Badge>
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetToDefaultBranding}
                          className="text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                        {user && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/profile')}
                            className="text-xs"
                          >
                            <User className="w-3 h-3 mr-1" />
                            Manage Labels
                          </Button>
                        )}
                      </div>
                    </div>
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
                      <div className="font-medium">Simelwe Ngcobo</div>
                      <div className="text-sm text-muted-foreground">Founder, ReBooked Solutions</div>
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
