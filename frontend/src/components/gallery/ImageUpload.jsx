import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { useImagesStore } from '../../store/useImagesStore';
import Button from '../ui/Button';

const ImageUpload = () => {
  const { uploadImage, isUploading, uploadProgress } = useImagesStore();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      await uploadImage(file);
    }
  }, [uploadImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          glass-card p-8 border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/30 hover:border-primary/50'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-white text-lg">Uploading... {uploadProgress}%</p>
              <div className="w-full max-w-xs bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-primary" />
              <div className="text-center">
                <p className="text-white text-lg font-medium">
                  {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  or click to select
                </p>
              </div>
              <Button variant="glass" size="sm">
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
