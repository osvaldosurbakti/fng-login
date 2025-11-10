// components/products/ImageUpload.tsx
"use client";

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUpload(data.imageUrl);
      } else {
        alert(data.error || 'Upload failed');
        setPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error. Please try again.');
      setPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Preview Image */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {preview ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-2">
          Supports: JPEG, PNG, WebP • Max: 5MB
        </p>
      </div>

      {/* Current Image Info */}
      {currentImage && !preview && (
        <div className="text-xs text-gray-500">
          Current image will be removed when you upload a new one.
        </div>
      )}
    </div>
  );
}