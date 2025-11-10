import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, Image, CheckCircle, XCircle } from 'lucide-react';
import { useImagesStore } from '../../store/useImagesStore';
import Button from '../ui/Button';

const ImageUpload = () => {
  const { uploadImage, isUploading, uploadProgress } = useImagesStore();
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadResults, setUploadResults] = useState({ success: 0, failed: 0 });
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadQueue(acceptedFiles);
      setUploadResults({ success: 0, failed: 0 });
      setCurrentUploadIndex(0);

      // Upload files sequentially
      for (let i = 0; i < acceptedFiles.length; i++) {
        setCurrentUploadIndex(i);
        try {
          await uploadImage(acceptedFiles[i]);
          setUploadResults(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (error) {
          console.error(`Failed to upload ${acceptedFiles[i].name}:`, error);
          setUploadResults(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }

      // Clear queue after 3 seconds
      setTimeout(() => {
        setUploadQueue([]);
        setUploadResults({ success: 0, failed: 0 });
      }, 3000);
    }
  }, [uploadImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    multiple: true,
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
          {isUploading && uploadQueue.length > 0 ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-white text-lg">
                  Uploading {currentUploadIndex + 1} of {uploadQueue.length}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {uploadQueue[currentUploadIndex]?.name || 'Processing...'}
                </p>
              </div>
              <div className="w-full max-w-xs bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-200"
                  style={{
                    width: `${((currentUploadIndex + (uploadProgress / 100)) / uploadQueue.length) * 100}%`
                  }}
                />
              </div>
              <div className="flex items-center space-x-4 text-sm">
                {uploadResults.success > 0 && (
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {uploadResults.success} uploaded
                  </span>
                )}
                {uploadResults.failed > 0 && (
                  <span className="flex items-center text-red-400">
                    <XCircle className="w-4 h-4 mr-1" />
                    {uploadResults.failed} failed
                  </span>
                )}
              </div>
            </>
          ) : uploadQueue.length === 0 && (uploadResults.success > 0 || uploadResults.failed > 0) ? (
            <>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-white text-lg font-medium">Upload Complete!</p>
                <p className="text-white/60 text-sm mt-1">
                  {uploadResults.success} successful, {uploadResults.failed} failed
                </p>
              </div>
            </>
          ) : (
            <>
              <Image className="w-12 h-12 text-primary" />
              <div className="text-center">
                <p className="text-white text-lg font-medium">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images'}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  or click to select multiple files
                </p>
              </div>
              <Button variant="glass" size="sm">
                Choose Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
