import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CustomLabelUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      toast.error("Please upload an image (PNG, JPG, SVG) or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    toast.success("File selected successfully!");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      // TODO: Implement file upload to Supabase storage
      // For now, just simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Your custom label request has been submitted! Our design team will contact you within 24 hours.");
      setSelectedFile(null);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Custom Label Design
        </CardTitle>
        <CardDescription>
          Upload your design or photo and our team will create a custom label for your bottles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="text-center space-y-4">
            {selectedFile ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image className="w-8 h-8 text-green-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Supported: PNG, JPG, SVG, PDF (Max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Design Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• High resolution images (300 DPI) work best</li>
                <li>• Include text, logos, or artwork you want on your label</li>
                <li>• Our design team will optimize your design for bottle labels</li>
                <li>• You'll receive a proof for approval before printing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Submitting Request...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Submit Custom Label Request
            </>
          )}
        </Button>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          Our design team will create your label based on the uploaded file and contact you within 24 hours.
        </p>
      </CardContent>
    </Card>
  );
};

export default CustomLabelUpload;