import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Send, 
  Building2,
  Droplets,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";

interface BottleSize {
  id: string;
  size: string;
  volume: string;
  dimensions: { width: number; height: number };
  popular?: boolean;
}

interface LabelSettings {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const Enterprise = () => {
  const [selectedSize, setSelectedSize] = useState<string>("500ml");
  const [uploadedLabel, setUploadedLabel] = useState<string | null>(null);
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    x: 50,
    y: 40,
    scale: 100,
    rotation: 0
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [requirements, setRequirements] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottleSizes: BottleSize[] = [
    { id: "250ml", size: "250ml", volume: "Small", dimensions: { width: 60, height: 120 } },
    { id: "500ml", size: "500ml", volume: "Regular", dimensions: { width: 70, height: 160 }, popular: true },
    { id: "1L", size: "1L", volume: "Large", dimensions: { width: 80, height: 200 } },
    { id: "1.5L", size: "1.5L", volume: "Family", dimensions: { width: 90, height: 240 } },
    { id: "2L", size: "2L", volume: "XL", dimensions: { width: 100, height: 280 }, popular: true },
    { id: "5L", size: "5L", volume: "Bulk", dimensions: { width: 140, height: 320 } }
  ];

  const currentBottle = bottleSizes.find(bottle => bottle.id === selectedSize) || bottleSizes[1];

  const handleSizeChange = (newSize: string) => {
    if (newSize === selectedSize) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedSize(newSize);
      setIsAnimating(false);
    }, 150);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedLabel(result);
        toast.success("Label uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLabelSettingChange = (setting: keyof LabelSettings, value: number) => {
    setLabelSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const resetLabel = () => {
    setLabelSettings({
      x: 50,
      y: 40,
      scale: 100,
      rotation: 0
    });
    toast.success("Label position reset");
  };

  const removeLabel = () => {
    setUploadedLabel(null);
    setLabelSettings({
      x: 50,
      y: 40,
      scale: 100,
      rotation: 0
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success("Label removed");
  };

  const handleEnterpriseRequest = () => {
    if (!companyName || !contactEmail) {
      toast.error("Please fill in company name and contact email");
      return;
    }

    // Simulate sending enterprise request
    toast.success("Enterprise request sent successfully! We'll contact you within 24 hours.");
    
    // Reset form
    setCompanyName("");
    setContactEmail("");
    setRequirements("");
  };

  const BottleVisualization = () => (
    <div className="relative flex items-center justify-center h-96 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-2xl overflow-hidden">
      {/* Bottle SVG */}
      <div 
        className={`relative transition-all duration-300 ease-in-out ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
        style={{
          width: currentBottle.dimensions.width,
          height: currentBottle.dimensions.height,
        }}
      >
        {/* Bottle Shape */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          {/* Bottle body gradient */}
          <defs>
            <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="30%" stopColor="#f0f9ff" />
              <stop offset="70%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#cffafe" />
            </linearGradient>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Bottle outline */}
          <path
            d="M35 25 L35 15 Q35 10 40 10 L60 10 Q65 10 65 15 L65 25 L62 25 L62 30 Q62 35 57 35 L43 35 Q38 35 38 30 L38 25 Z M38 35 L38 85 Q38 90 43 90 L57 90 Q62 90 62 85 L62 35"
            fill="url(#bottleGradient)"
            stroke="#0891b2"
            strokeWidth="1"
          />
          
          {/* Water inside */}
          <path
            d="M40 37 L40 83 Q40 87 44 87 L56 87 Q60 87 60 83 L60 37"
            fill="url(#waterGradient)"
          />
          
          {/* Bottle cap */}
          <rect x="40" y="10" width="20" height="8" rx="2" fill="#1e40af" />
          <rect x="42" y="8" width="16" height="4" rx="1" fill="#3b82f6" />
          
          {/* Highlights */}
          <ellipse cx="45" cy="45" rx="3" ry="8" fill="white" opacity="0.3" />
        </svg>

        {/* Custom Label Overlay */}
        {uploadedLabel && (
          <div
            className="absolute pointer-events-none transition-all duration-200"
            style={{
              left: `${labelSettings.x}%`,
              top: `${labelSettings.y}%`,
              transform: `translate(-50%, -50%) scale(${labelSettings.scale / 100}) rotate(${labelSettings.rotation}deg)`,
              width: '40%',
              height: '30%',
            }}
          >
            <img
              src={uploadedLabel}
              alt="Custom label"
              className="w-full h-full object-contain rounded"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          </div>
        )}
      </div>

      {/* Size indicator */}
      <div className="absolute bottom-4 left-4">
        <Badge variant="secondary" className="text-sm font-medium">
          {currentBottle.size} - {currentBottle.volume}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        {/* Header */}
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Enterprise Solutions
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Customize bottles with your brand logo in real-time. Perfect for corporate events, 
              promotional campaigns, and business partnerships.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Bottle Customization */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bottle Sizes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-primary" />
                    <span>Choose Bottle Size</span>
                  </CardTitle>
                  <CardDescription>
                    Select from our range of bottle sizes. Changes are applied in real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {bottleSizes.map((bottle) => (
                      <button
                        key={bottle.id}
                        onClick={() => handleSizeChange(bottle.id)}
                        className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          selectedSize === bottle.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-center space-y-1">
                          <div className="text-sm font-semibold">{bottle.size}</div>
                          <div className="text-xs text-muted-foreground">{bottle.volume}</div>
                        </div>
                        {bottle.popular && (
                          <Badge className="absolute -top-2 -right-2 text-xs">Popular</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bottle Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See your customized bottle in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BottleVisualization />
                </CardContent>
              </Card>
            </div>

            {/* Customization Controls */}
            <div className="space-y-6">
              {/* Upload Label */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-primary" />
                    <span>Upload Label</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your logo or label (max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, SVG up to 5MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedLabel && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={resetLabel}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        onClick={removeLabel}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Label Controls */}
              {uploadedLabel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Move className="w-5 h-5 text-primary" />
                      <span>Adjust Label</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Position X</Label>
                        <Slider
                          value={[labelSettings.x]}
                          onValueChange={(value) => handleLabelSettingChange('x', value[0])}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Position Y</Label>
                        <Slider
                          value={[labelSettings.y]}
                          onValueChange={(value) => handleLabelSettingChange('y', value[0])}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Scale ({labelSettings.scale}%)</Label>
                        <Slider
                          value={[labelSettings.scale]}
                          onValueChange={(value) => handleLabelSettingChange('scale', value[0])}
                          min={50}
                          max={200}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Rotation ({labelSettings.rotation}°)</Label>
                        <Slider
                          value={[labelSettings.rotation]}
                          onValueChange={(value) => handleLabelSettingChange('rotation', value[0])}
                          min={-180}
                          max={180}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enterprise Request */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-primary" />
                    <span>Request Quote</span>
                  </CardTitle>
                  <CardDescription>
                    Get a custom quote for your enterprise order
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Quantity needed, timeline, special requirements..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleEnterpriseRequest}
                    className="w-full"
                    size="lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Enterprise Request
                  </Button>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>We'll respond within 24 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Enterprise;
