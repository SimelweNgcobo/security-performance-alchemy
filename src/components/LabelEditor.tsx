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
import { toast } from 'sonner';
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
  Settings
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

const LabelEditor: React.FC = () => {
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

  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
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
  };

  const addImageElement = (src: string) => {
    const newElement: ImageElement = {
      id: `image-${Date.now()}`,
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
        addImageElement(result);
        toast.success("Image added to canvas!");
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    setDesign(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  const deleteElement = (id: string) => {
    setDesign(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (id: string) => {
    const element = design.elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        layer: design.elements.length
      };
      setDesign(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
      setSelectedElement(newElement.id);
    }
  };

  const moveElementLayer = (id: string, direction: 'up' | 'down') => {
    const element = design.elements.find(el => el.id === id);
    if (!element) return;

    const newLayer = direction === 'up' 
      ? Math.min(element.layer + 1, design.elements.length - 1)
      : Math.max(element.layer - 1, 0);

    updateElement(id, { layer: newLayer });
  };

  const resetCanvas = () => {
    setDesign({
      elements: [],
      backgroundColor: '#ffffff'
    });
    setSelectedElement(null);
    toast.success("Canvas reset!");
  };

  const useDefaultBranding = () => {
    // Add default branding elements
    const logoElement: ImageElement = {
      id: `logo-${Date.now()}`,
      type: 'image',
      src: '/placeholder.svg', // Will be replaced with actual default logo
      x: 20,
      y: 10,
      width: 60,
      height: 40,
      rotation: 0,
      visible: true,
      layer: 0
    };

    const brandTextElement: TextElement = {
      id: `brand-text-${Date.now()}`,
      type: 'text',
      content: 'MyFuze Premium Water',
      x: LABEL_WIDTH_PX / 2 - 100,
      y: LABEL_HEIGHT_PX / 2 - 10,
      width: 200,
      height: 20,
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#0066cc',
      fontWeight: 'bold',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      rotation: 0,
      visible: true,
      layer: 1
    };

    setDesign({
      elements: [logoElement, brandTextElement],
      backgroundColor: '#f0f9ff'
    });
    toast.success("Default branding applied!");
  };

  const exportDesign = () => {
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

  const selectedElementData = selectedElement 
    ? design.elements.find(el => el.id === selectedElement)
    : null;

  // Mouse event handlers for canvas interaction
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const element = design.elements.find(el => el.id === selectedElement);
    if (element) {
      const newX = Math.max(0, Math.min(element.x + deltaX, LABEL_WIDTH_PX - element.width));
      const newY = Math.max(0, Math.min(element.y + deltaY, LABEL_HEIGHT_PX - element.height));
      
      updateElement(selectedElement, { x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, selectedElement, dragStart, design.elements]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-4">
      {/* Canvas Area */}
      <div className="lg:col-span-3">
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
                  onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 overflow-auto">
              <div
                ref={canvasRef}
                className="relative mx-auto border border-gray-400 shadow-lg"
                style={{
                  width: LABEL_WIDTH_PX * (zoom / 100),
                  height: LABEL_HEIGHT_PX * (zoom / 100),
                  backgroundColor: design.backgroundColor,
                  backgroundImage: design.backgroundImage ? `url(${design.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
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
            
            {/* Canvas Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={useDefaultBranding}>
                  Use Default Branding
                </Button>
                <Button variant="outline" size="sm" onClick={resetCanvas}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Canvas
                </Button>
              </div>
              <Button onClick={exportDesign} className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Export Design
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Panel */}
      <div className="space-y-4">
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
