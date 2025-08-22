import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { userLabelsService } from '@/services/userLabels';
import {
  Upload,
  Type,
  Image as ImageIcon,
  Palette,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  Download,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Send,
  Save,
  Star
} from 'lucide-react';

// Convert mm to pixels (at 96 DPI: 1mm = 3.78 pixels)
const MM_TO_PX = 3.78;
const LABEL_WIDTH_MM = 264;
const LABEL_HEIGHT_MM = 60;
const LABEL_WIDTH_PX = LABEL_WIDTH_MM * MM_TO_PX;
const LABEL_HEIGHT_PX = LABEL_HEIGHT_MM * MM_TO_PX;

interface TextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  visible: boolean;
  layer: number;
}

interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  layer: number;
}

type Element = TextElement | ImageElement;

interface LabelDesign {
  elements: Element[];
  backgroundColor: string;
  backgroundImage?: string;
}

interface LabelEditorProps {
  onSave?: () => void; // Callback when a label is saved
}

const LabelEditor: React.FC<LabelEditorProps> = ({ onSave }) => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [design, setDesign] = useState<LabelDesign>({
    elements: [],
    backgroundColor: '#ffffff'
  });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [isResizing, setIsResizing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    isDefault: false
  });

  // Font options
  const fontFamilies = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Times New Roman, serif',
    'Georgia, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Impact, sans-serif',
    'Comic Sans MS, cursive'
  ];

  const addTextElement = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      const newElement: TextElement = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        content: 'Your Text Here',
        x: LABEL_WIDTH_PX / 2 - 50,
        y: LABEL_HEIGHT_PX / 2 - 10,
        width: 100,
        height: 20,
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        rotation: 0,
        visible: true,
        layer: design.elements.length
      };

      setDesign(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
      setSelectedElement(newElement.id);
      toast.success('Text element added successfully!');
    } catch (error) {
      console.error('Error adding text element:', error);
      toast.error('Failed to add text element');
    }
  }, [design.elements.length]);

  const addImageElement = useCallback((src: string) => {
    try {
      const newElement: ImageElement = {
        id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        src,
        x: LABEL_WIDTH_PX / 2 - 50,
        y: LABEL_HEIGHT_PX / 2 - 50,
        width: 100,
        height: 100,
        rotation: 0,
        visible: true,
        layer: design.elements.length
      };

      setDesign(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
      setSelectedElement(newElement.id);
    } catch (error) {
      console.error('Error adding image element:', error);
      toast.error('Failed to add image element');
    }
  }, [design.elements.length]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (result) {
          addImageElement(result);
          toast.success('Image added to canvas!');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read image file');
    };

    reader.readAsDataURL(file);

    // Clear the input to allow selecting the same file again
    event.target.value = '';
  }, [addImageElement]);

  const updateElement = useCallback((id: string, updates: Partial<Element>) => {
    try {
      setDesign(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === id ? { ...el, ...updates } as Element : el
        )
      }));
    } catch (error) {
      console.error('Error updating element:', error);
      toast.error('Failed to update element');
    }
  }, []);

  const deleteElement = useCallback((id: string) => {
    try {
      setDesign(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== id)
      }));
      if (selectedElement === id) {
        setSelectedElement(null);
      }
      toast.success('Element deleted successfully');
    } catch (error) {
      console.error('Error deleting element:', error);
      toast.error('Failed to delete element');
    }
  }, [selectedElement]);

  const duplicateElement = useCallback((id: string) => {
    try {
      const element = design.elements.find(el => el.id === id);
      if (element) {
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: Math.min(element.x + 20, LABEL_WIDTH_PX - element.width),
          y: Math.min(element.y + 20, LABEL_HEIGHT_PX - element.height),
          layer: design.elements.length
        };
        setDesign(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
        }));
        setSelectedElement(newElement.id);
        toast.success('Element duplicated successfully');
      }
    } catch (error) {
      console.error('Error duplicating element:', error);
      toast.error('Failed to duplicate element');
    }
  }, [design.elements]);

  const moveElementLayer = (id: string, direction: 'up' | 'down') => {
    const element = design.elements.find(el => el.id === id);
    if (!element) return;

    const newLayer = direction === 'up' 
      ? Math.min(element.layer + 1, design.elements.length - 1)
      : Math.max(element.layer - 1, 0);

    updateElement(id, { layer: newLayer });
  };

  const resetCanvas = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      setDesign({
        elements: [],
        backgroundColor: '#ffffff'
      });
      setSelectedElement(null);
      toast.success('Canvas reset successfully!');
    } catch (error) {
      console.error('Error resetting canvas:', error);
      toast.error('Failed to reset canvas');
    }
  }, []);

  const useDefaultBranding = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Use the official MyFuze label image that fits the exact dimensions
    const myFuzeLabelElement: ImageElement = {
      id: `myfuze-label-${Date.now()}`,
      type: 'image',
      src: 'https://cdn.builder.io/api/v1/image/assets%2F78c54f0f820f4ef89b161934d7e5758a%2F9f55ebccb8d94d739820d7c8aa1bd09a?format=webp&width=800',
      x: 0,
      y: 0,
      width: LABEL_WIDTH_PX,  // Full canvas width
      height: LABEL_HEIGHT_PX, // Full canvas height
      rotation: 0,
      visible: true,
      layer: 0
    };

    setDesign({
      elements: [myFuzeLabelElement],
      backgroundColor: '#ffffff'
    });
    toast.success("MyFuze default label applied! This fits the exact bottle dimensions.");
  };

  // Add design to quote request
  const addToQuoteRequest = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (design.elements.length === 0) {
      toast.error("Please create a design first before adding to quote request");
      return;
    }

    // Generate a preview image of the current design (simplified)
    const designPreview = {
      id: `design-${Date.now()}`,
      timestamp: new Date().toISOString(),
      design: design,
      dimensions: { width: LABEL_WIDTH_MM, height: LABEL_HEIGHT_MM }
    };

    // Store in localStorage for now (in real implementation, this would go to a database)
    const existingDesigns = JSON.parse(localStorage.getItem('quoteDesigns') || '[]');
    existingDesigns.push(designPreview);
    localStorage.setItem('quoteDesigns', JSON.stringify(existingDesigns));

    toast.success("Design added to quote request! You can now submit your custom quote.");
    setShowQuoteModal(true);
  };

  const exportDesign = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    // In a real implementation, this would generate a PDF or high-res image
    const designData = {
      ...design,
      dimensions: { width: LABEL_WIDTH_MM, height: LABEL_HEIGHT_MM }
    };

    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'label-design.json';
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Design exported successfully!");
  };

  const handleSaveToProfile = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to save labels to your profile');
      return;
    }

    if (!saveForm.name.trim()) {
      toast.error('Please enter a name for your label');
      return;
    }

    if (design.elements.length === 0) {
      toast.error('Please add some elements to your design before saving');
      return;
    }

    try {
      const designData = {
        backgroundColor: design.backgroundColor,
        elements: design.elements
      };

      const savedLabel = await userLabelsService.saveLabel(
        user.id,
        saveForm.name.trim(),
        designData,
        saveForm.description.trim() || undefined,
        saveForm.isDefault
      );

      if (savedLabel) {
        setShowSaveDialog(false);
        setSaveForm({ name: '', description: '', isDefault: false });

        // Call the onSave callback to refresh the parent component
        if (onSave) {
          onSave();
        }
      }
    } catch (error) {
      console.error('Error saving label:', error);
      toast.error('Failed to save label. Please try again.');
    }
  }, [user, saveForm, design, onSave]);

  const openSaveDialog = useCallback(() => {
    if (!user) {
      toast.error('Please sign in to save labels');
      return;
    }

    if (design.elements.length === 0) {
      toast.error('Please add some elements to your design first');
      return;
    }

    setShowSaveDialog(true);
  }, [user, design.elements.length]);

  // Memoize the selected element data to prevent unnecessary re-renders
  const selectedElementData = useMemo(() => {
    return selectedElement
      ? design.elements.find(el => el.id === selectedElement)
      : null;
  }, [selectedElement, design.elements]);

  // Mouse event handlers for canvas interaction
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    try {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const element = design.elements.find(el => el.id === selectedElement);
      if (element) {
        const newX = Math.max(0, Math.min(element.x + deltaX, LABEL_WIDTH_PX - element.width));
        const newY = Math.max(0, Math.min(element.y + deltaY, LABEL_HEIGHT_PX - element.height));

        updateElement(selectedElement, { x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    } catch (error) {
      console.error('Error during mouse move:', error);
      setIsDragging(false);
    }
  }, [isDragging, selectedElement, dragStart, design.elements, updateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any remaining event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="label-editor grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Canvas Area */}
      <div className="lg:col-span-3 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Label Designer
                </CardTitle>
                <CardDescription>
                  Design your custom water bottle label (264mm × 60mm)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{LABEL_WIDTH_MM}mm × {LABEL_HEIGHT_MM}mm</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoom(prev => Math.max(25, prev - 25));
                  }}
                  className="no-scroll"
                  disabled={zoom <= 25}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoom(prev => Math.min(300, prev + 25));
                  }}
                  className="no-scroll"
                  disabled={zoom >= 300}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoom(100);
                  }}
                  className="no-scroll"
                  title="Reset zoom to 100%"
                >
                  100%
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[70vh] smooth-scroll">
              <div className="flex items-center justify-center min-h-[400px] transition-all duration-200 ease-in-out">
                <div
                  ref={canvasRef}
                  className="relative border border-gray-400 shadow-lg cursor-crosshair"
                  style={{
                    width: LABEL_WIDTH_PX * (zoom / 100),
                    height: LABEL_HEIGHT_PX * (zoom / 100),
                    backgroundColor: design.backgroundColor,
                    backgroundImage: design.backgroundImage ? `url(${design.backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minWidth: '200px',
                    minHeight: '50px'
                  }}
                  onClick={() => setSelectedElement(null)}
                >
                  {/* Render elements sorted by layer */}
                  {design.elements
                    .sort((a, b) => a.layer - b.layer)
                    .map((element) => (
                      <div
                        key={element.id}
                        className={`absolute cursor-move border-2 transition-all ${
                          selectedElement === element.id
                            ? 'border-blue-500 shadow-md'
                            : 'border-transparent hover:border-blue-300'
                        } ${!element.visible ? 'opacity-50' : ''}`}
                        style={{
                          left: element.x * (zoom / 100),
                          top: element.y * (zoom / 100),
                          width: element.width * (zoom / 100),
                          height: element.height * (zoom / 100),
                          transform: `rotate(${element.rotation}deg)`,
                          transformOrigin: 'center'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, element.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${element.type} element: ${element.type === 'text' ? (element as TextElement).content : 'Image'}`}
                      >
                        {element.type === 'text' ? (
                          <div
                            className="w-full h-full flex items-center"
                            style={{
                              fontSize: (element as TextElement).fontSize * (zoom / 100),
                              fontFamily: (element as TextElement).fontFamily,
                              color: (element as TextElement).color,
                              fontWeight: (element as TextElement).fontWeight,
                              fontStyle: (element as TextElement).fontStyle,
                              textDecoration: (element as TextElement).textDecoration,
                              textAlign: (element as TextElement).textAlign,
                              overflow: 'hidden',
                              wordWrap: 'break-word'
                            }}
                          >
                            {(element as TextElement).content}
                          </div>
                        ) : (
                          <img
                            src={(element as ImageElement).src}
                            alt="Label element"
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        )}

                        {/* Selection handles */}
                        {selectedElement === element.id && (
                          <>
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-se-resize" />
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            
            {/* Canvas Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={useDefaultBranding}
                  className="text-xs sm:text-sm no-scroll"
                  title="Apply MyFuze default branding template"
                >
                  Use Default Branding
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={addToQuoteRequest}
                  className="text-xs sm:text-sm no-scroll bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Add to Quote Request
                </Button>
                <Button variant="outline" size="sm" onClick={resetCanvas} className="text-xs sm:text-sm no-scroll">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Canvas
                </Button>
              </div>
              <div className="flex gap-2">
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={openSaveDialog}
                      className="text-xs sm:text-sm no-scroll"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save to Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Save Label to Profile</DialogTitle>
                      <DialogDescription>
                        Save this design to your profile for use in enterprise orders
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="label-name">Label Name *</Label>
                        <Input
                          id="label-name"
                          value={saveForm.name}
                          onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="My Custom Label"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="label-description">Description</Label>
                        <Textarea
                          id="label-description"
                          value={saveForm.description}
                          onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of this label design..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="set-default"
                          checked={saveForm.isDefault}
                          onCheckedChange={(checked) => setSaveForm(prev => ({ ...prev, isDefault: !!checked }))}
                        />
                        <Label htmlFor="set-default" className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4" />
                          Set as my default label
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveToProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Label
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={exportDesign} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm no-scroll">
                  <Download className="w-4 h-4 mr-2" />
                  Export Design
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Panel */}
      <div className="space-y-4 order-1 lg:order-2">
        {/* Add Elements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={addTextElement}
              variant="outline" 
              className="w-full justify-start"
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline" 
              className="w-full justify-start"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Canvas Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Canvas Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="bg-color">Background Color</Label>
              <Input
                id="bg-color"
                type="color"
                value={design.backgroundColor}
                onChange={(e) => setDesign(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Element Properties */}
        {selectedElementData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Element Properties
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateElement(selectedElementData.id, { visible: !selectedElementData.visible })}
                  >
                    {selectedElementData.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateElement(selectedElementData.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteElement(selectedElementData.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedElementData.type === 'text' && (
                <>
                  <div>
                    <Label htmlFor="text-content">Text Content</Label>
                    <Textarea
                      id="text-content"
                      value={(selectedElementData as TextElement).content}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="font-family">Font</Label>
                      <Select
                        value={(selectedElementData as TextElement).fontFamily}
                        onValueChange={(value) => updateElement(selectedElementData.id, { fontFamily: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font.split(',')[0]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="font-size">Size</Label>
                      <Input
                        id="font-size"
                        type="number"
                        value={(selectedElementData as TextElement).fontSize}
                        onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) || 16 })}
                        min="8"
                        max="72"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={(selectedElementData as TextElement).color}
                      onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={selectedElementData.fontWeight === 'bold' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateElement(selectedElementData.id, { 
                        fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.fontStyle === 'italic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateElement(selectedElementData.id, { 
                        fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.textDecoration === 'underline' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateElement(selectedElementData.id, { 
                        textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' 
                      })}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant={selectedElementData.textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateElement(selectedElementData.id, { textAlign: 'left' })}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateElement(selectedElementData.id, { textAlign: 'center' })}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedElementData.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateElement(selectedElementData.id, { textAlign: 'right' })}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              <Separator />

              {/* Common properties for all elements */}
              <div>
                <Label>Position & Size</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="element-x" className="text-xs">X</Label>
                    <Input
                      id="element-x"
                      type="number"
                      value={Math.round(selectedElementData.x)}
                      onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="element-y" className="text-xs">Y</Label>
                    <Input
                      id="element-y"
                      type="number"
                      value={Math.round(selectedElementData.y)}
                      onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="element-width" className="text-xs">Width</Label>
                    <Input
                      id="element-width"
                      type="number"
                      value={Math.round(selectedElementData.width)}
                      onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 10 })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="element-height" className="text-xs">Height</Label>
                    <Input
                      id="element-height"
                      type="number"
                      value={Math.round(selectedElementData.height)}
                      onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 10 })}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="element-rotation">Rotation ({selectedElementData.rotation}°)</Label>
                <Slider
                  id="element-rotation"
                  value={[selectedElementData.rotation]}
                  onValueChange={(value) => updateElement(selectedElementData.id, { rotation: value[0] })}
                  min={-180}
                  max={180}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Layer Control</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveElementLayer(selectedElementData.id, 'up')}
                    disabled={selectedElementData.layer >= design.elements.length - 1}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    Forward
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveElementLayer(selectedElementData.id, 'down')}
                    disabled={selectedElementData.layer <= 0}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Layers Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {design.elements
                .sort((a, b) => b.layer - a.layer)
                .map((element) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                      selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <span className="text-sm truncate">
                      {element.type === 'text' 
                        ? (element as TextElement).content.substring(0, 15) + '...'
                        : 'Image'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElement(element.id, { visible: !element.visible });
                        }}
                      >
                        {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              {design.elements.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No elements yet. Add text or images to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabelEditor;
export type { LabelEditorProps };
