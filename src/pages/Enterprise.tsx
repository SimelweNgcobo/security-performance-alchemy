import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  Type,
  Palette,
  RefreshCw,
  Download,
  Building2,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";

interface LabelCustomization {
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  uploadedImage: string | null;
  imagePosition: { x: number; y: number };
  imageScale: number;
}

const Enterprise = () => {
  const [labelCustomization, setLabelCustomization] = useState<LabelCustomization>({
    text: "",
    fontSize: 16,
    fontFamily: "Arial",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    uploadedImage: null,
    imagePosition: { x: 10, y: 10 },
    imageScale: 100
  });
  const [isDefault, setIsDefault] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontOptions = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Trebuchet MS",
    "Impact",
    "Comic Sans MS"
  ];

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
        setLabelCustomization(prev => ({
          ...prev,
          uploadedImage: result
        }));
        setIsDefault(false);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomizationChange = (key: keyof LabelCustomization, value: any) => {
    setLabelCustomization(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDefault(false);
  };

  const resetToDefault = () => {
    setLabelCustomization({
      text: "",
      fontSize: 16,
      fontFamily: "Arial",
      textColor: "#000000",
      backgroundColor: "#ffffff",
      uploadedImage: null,
      imagePosition: { x: 10, y: 10 },
      imageScale: 100
    });
    setIsDefault(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success("Reset to default branding");
  };

  const downloadLabel = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for 224mm x 60mm at 300 DPI
    const width = Math.round((224 / 25.4) * 300); // Convert mm to pixels
    const height = Math.round((60 / 25.4) * 300);
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = labelCustomization.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Add text if present
    if (labelCustomization.text) {
      ctx.fillStyle = labelCustomization.textColor;
      ctx.font = `${labelCustomization.fontSize * 4}px ${labelCustomization.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelCustomization.text, width / 2, height / 2);
    }

    // Download the canvas as image
    const link = document.createElement('a');
    link.download = 'custom-label.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success("Label downloaded successfully!");
  };

  // Convert mm to pixels for display (using 96 DPI for screen)
  // Make responsive - scale down on mobile
  const baseLabelWidthPx = Math.round((224 / 25.4) * 96);
  const baseLabelHeightPx = Math.round((60 / 25.4) * 96);

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      const maxWidth = screenWidth < 640 ? screenWidth - 80 : // Mobile with padding
                     screenWidth < 1024 ? screenWidth * 0.8 : // Tablet
                     baseLabelWidthPx; // Desktop

      const scale = Math.min(maxWidth / baseLabelWidthPx, 1);
      return {
        width: Math.round(baseLabelWidthPx * scale),
        height: Math.round(baseLabelHeightPx * scale),
        scale
      };
    }
    return { width: baseLabelWidthPx, height: baseLabelHeightPx, scale: 1 };
  };

  const { width: labelWidthPx, height: labelHeightPx, scale: labelScale } = getResponsiveDimensions();

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
                Label Customization
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Design your custom labels with our easy-to-use label designer. 
              Upload images, add text, and customize colors to create the perfect label.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8 max-w-7xl mx-auto">
            {/* Label Preview */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle>Label Preview</CardTitle>
                  <CardDescription>
                    Live preview of your label - Dimensions: 224mm × 60mm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center px-2 sm:px-0">
                    <div
                      className="border-2 border-dashed border-gray-300 relative overflow-hidden mx-auto"
                      style={{
                        width: `${labelWidthPx}px`,
                        height: `${labelHeightPx}px`,
                        backgroundColor: labelCustomization.backgroundColor,
                        maxWidth: '100%',
                        minWidth: '200px'
                      }}
                    >
                      {/* Background Image */}
                      {labelCustomization.uploadedImage && (
                        <img
                          src={labelCustomization.uploadedImage}
                          alt="Uploaded"
                          className="absolute object-contain"
                          style={{
                            left: `${labelCustomization.imagePosition.x}px`,
                            top: `${labelCustomization.imagePosition.y}px`,
                            width: `${(labelWidthPx * labelCustomization.imageScale) / 100}px`,
                            height: 'auto'
                          }}
                        />
                      )}
                      
                      {/* Default Branding */}
                      {isDefault && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary mb-1">Your Brand</div>
                            <div className="text-sm text-muted-foreground">Default Branding</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Custom Text */}
                      {labelCustomization.text && !isDefault && (
                        <div
                          className="absolute inset-0 flex items-center justify-center p-2 text-center"
                          style={{
                            color: labelCustomization.textColor,
                            fontSize: `${labelCustomization.fontSize * labelScale}px`,
                            fontFamily: labelCustomization.fontFamily,
                            wordBreak: 'break-word'
                          }}
                        >
                          {labelCustomization.text}
                        </div>
                      )}
                      
                      {/* Dimension Labels */}
                      <div className="absolute -bottom-6 left-0 right-0 text-xs text-muted-foreground text-center">
                        224mm × 60mm
                      </div>

                      {/* Mobile scale indicator */}
                      {labelScale < 1 && (
                        <div className="absolute -top-6 left-0 right-0 text-xs text-muted-foreground text-center">
                          Scaled for mobile ({Math.round(labelScale * 100)}%)
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization Controls */}
            <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
              {/* Default Button */}
              <Card>
                <CardContent className="pt-4 lg:pt-6">
                  <Button 
                    onClick={resetToDefault}
                    variant={isDefault ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Default Branding
                  </Button>
                  {isDefault && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Using our default branding
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Upload Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-primary" />
                    <span>Upload Image</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your logo or image (max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-primary transition-colors active:scale-95"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Tap to upload or drag & drop
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
                </CardContent>
              </Card>

              {/* Text Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Type className="w-5 h-5 text-primary" />
                    <span>Add Text</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="text">Text</Label>
                    <Input
                      id="text"
                      placeholder="Enter your text"
                      value={labelCustomization.text}
                      onChange={(e) => handleCustomizationChange('text', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fontSize">Font Size (8-72px)</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      min="8"
                      max="72"
                      value={labelCustomization.fontSize}
                      onChange={(e) => handleCustomizationChange('fontSize', parseInt(e.target.value) || 16)}
                      className="text-base"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={labelCustomization.fontFamily}
                      onValueChange={(value) => handleCustomizationChange('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={labelCustomization.textColor}
                        onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                        className="w-12 sm:w-16 h-10 p-1 rounded-md"
                      />
                      <Input
                        value={labelCustomization.textColor}
                        onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Color */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <span>Background Color</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={labelCustomization.backgroundColor}
                        onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
                        className="w-12 sm:w-16 h-10 p-1 rounded-md"
                      />
                      <Input
                        value={labelCustomization.backgroundColor}
                        onChange={(e) => handleCustomizationChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Download */}
              <Card>
                <CardContent className="pt-4 lg:pt-6">
                  <Button 
                    onClick={downloadLabel}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Label
                  </Button>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>High-resolution PNG format</span>
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
