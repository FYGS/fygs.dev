"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  ImageIcon, 
  AlertCircle, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
  prefix?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export function ImageUpload({
  onImageUploaded,
  currentImageUrl,
  folder = 'images',
  prefix = 'course',
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview URL with currentImageUrl prop
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const resetUploadState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
    });
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed' 
      };
    }

    return { valid: true };
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      toast.error(validation.error);
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      success: false,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('prefix', prefix);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        success: true,
      });

      setPreviewUrl(result.url);
      onImageUploaded(result.url);
      toast.success('Image uploaded successfully!');

      // Reset success state after 2 seconds
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, success: false, progress: 0 }));
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        success: false,
      });
      toast.error(errorMessage);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploadState.isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploadState.isUploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleRemoveImage = async () => {
    if (!previewUrl) return;

    try {
      setUploadState(prev => ({ ...prev, isUploading: true }));

      // Extract file path from URL for deletion
      const urlPath = new URL(previewUrl).pathname;
      const objectName = urlPath.split('/').slice(2).join('/'); // Remove bucket name from path
      
      if (objectName) {
        const response = await fetch(`/api/upload/image?objectName=${encodeURIComponent(objectName)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete image');
        }
      }

      setPreviewUrl(null);
      onImageUploaded('');
      resetUploadState();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove image');
      setUploadState(prev => ({ ...prev, isUploading: false }));
    }
  };

  const openFileDialog = () => {
    if (!disabled && !uploadState.isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReplace = () => {
    openFileDialog();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Label className="text-sm font-medium">Course Cover Image</Label>
      
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          dragActive && 'border-blue-500 bg-blue-950/20',
          uploadState.error && 'border-red-500',
          uploadState.success && 'border-green-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <CardContent className="p-0">
          {previewUrl ? (
            // Image Preview
            <div className="relative group">
              <div className="aspect-video w-full overflow-hidden bg-muted/20">
                <Image
                  src={previewUrl}
                  alt="Course cover preview"
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              
              {/* Hover overlay with actions */}
              {!uploadState.isUploading && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleReplace}
                      disabled={disabled}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload progress overlay */}
              {uploadState.isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Uploading...</p>
                    <Progress value={uploadState.progress} className="w-48 mt-2" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Upload Area
            <div
              className={cn(
                'aspect-video flex flex-col items-center justify-center p-8 border-2 border-dashed transition-colors',
                dragActive ? 'border-blue-500 bg-blue-950/20' : 'border-slate-600',
                !disabled && !uploadState.isUploading && 'cursor-pointer hover:bg-slate-800/50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              {uploadState.isUploading ? (
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-sm font-medium mb-2">Uploading image...</p>
                  <Progress value={uploadState.progress} className="w-48" />
                  <p className="text-xs text-slate-500 mt-2">{uploadState.progress}%</p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Course Cover</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Drag and drop an image here, or click to select
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={disabled}
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                  <p className="text-xs text-slate-500 mt-3">
                    PNG, JPG, GIF or WebP (max 5MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {uploadState.error && (
            <div className="p-3 bg-red-950/20 border-t border-red-800">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{uploadState.error}</span>
              </div>
            </div>
          )}

          {uploadState.success && (
            <div className="p-3 bg-green-950/20 border-t border-green-800">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Image uploaded successfully!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploadState.isUploading}
      />
    </div>
  );
}
