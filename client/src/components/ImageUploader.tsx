import { useState, useRef, ChangeEvent } from 'react';
import { 
  Upload, 
  X, 
  ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { 
  fileToBase64, 
  isValidImageType, 
  isValidFileSize, 
  formatFileSize 
} from '@/lib/imageUtils';
import { MAX_FILE_SIZES } from '@/lib/constants';

interface ImageUploaderProps {
  onImageUpload: (formData: FormData) => Promise<any>;
  onSuccess?: (data: any) => void;
  fieldName?: string;
  maxSizeMB?: number;
  aspect?: 'square' | 'portrait' | 'landscape' | 'free';
  caption?: boolean;
  multiple?: boolean;
  className?: string;
  buttonText?: string;
  uploadingText?: string;
  infoText?: string;
  additionalData?: Record<string, string>;
}

const ImageUploader = ({
  onImageUpload,
  onSuccess,
  fieldName = 'image',
  maxSizeMB = 5,
  aspect = 'free',
  caption = false,
  multiple = false,
  className = '',
  buttonText = 'Upload Image',
  uploadingText = 'Uploading...',
  infoText = '',
  additionalData = {},
}: ImageUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    // Validate file type
    if (!isValidImageType(file)) {
      setError('Invalid file type. Please upload a JPEG, PNG or WebP image.');
      return;
    }
    
    // Validate file size
    if (!isValidFileSize(file, maxSizeMB)) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    
    // Convert to base64 for preview
    try {
      const base64 = await fileToBase64(file);
      setFilePreview(base64);
      setSelectedFile(file);
    } catch (err) {
      setError('Error generating preview. Please try another file.');
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append(fieldName, selectedFile);
    
    // Add caption if enabled
    if (caption && captionText.trim()) {
      formData.append('caption', captionText);
    }
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    try {
      const response = await onImageUpload(formData);
      
      toast({
        title: 'Image uploaded successfully',
        variant: 'default',
      });
      
      // Reset form
      setSelectedFile(null);
      setFilePreview(null);
      setCaptionText('');
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(response);
      }
      
    } catch (err: any) {
      setError(err?.message || 'Error uploading image. Please try again.');
      toast({
        title: 'Upload failed',
        description: err?.message || 'Error uploading image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setCaptionText('');
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Define aspect ratio styles
  const getAspectRatioClass = () => {
    switch(aspect) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return 'min-h-[200px]';
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        multiple={multiple}
      />
      
      {filePreview ? (
        <Card className="overflow-hidden">
          <div className={`relative ${getAspectRatioClass()} bg-muted`}>
            <img
              src={filePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-4">
            {caption && (
              <div className="mb-4">
                <label htmlFor="caption" className="block text-sm font-medium mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  id="caption"
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="Add a caption for your image"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedFile && (
                  <span>{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                )}
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="ml-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingText}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-dashed cursor-pointer hover:border-primary/50 transition-colors ${getAspectRatioClass()}`}
          onClick={triggerFileInput}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Upload className="h-6 w-6" />
            </div>
            
            <div className="text-center space-y-2">
              <h4 className="font-medium">{buttonText}</h4>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxSizeMB}MB (JPG, PNG, WebP)
              </p>
              {infoText && (
                <p className="text-xs text-muted-foreground">{infoText}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;
