import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { X, RotateCcw, Download, Sliders, Crop, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';

const ImageEditor = ({ image, onClose, onSave }) => {
  const [konvaImage, setKonvaImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1000, height: 700 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isTransforming, setIsTransforming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  const filters = [
    { name: 'none', label: 'Original' },
    { name: 'grayscale', label: 'Grayscale' },
    { name: 'sepia', label: 'Sepia' },
    { name: 'invert', label: 'Invert' },
    { name: 'vintage', label: 'Vintage' },
  ];

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = image.file_path;
    img.onload = () => {
      // Calculate dimensions to fit in canvas while maintaining aspect ratio
      const isMobile = window.innerWidth < 1024;
      const maxWidth = isMobile ? window.innerWidth - 40 : 1200;
      const maxHeight = isMobile ? window.innerHeight * 0.4 : 800;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      } else if (!isMobile) {
        // Scale up small images to make them more visible (desktop only)
        const minSize = 600;
        if (width < minSize && height < minSize) {
          const ratio = minSize / Math.max(width, height);
          width = width * ratio;
          height = height * ratio;
        }
      }

      setImageDimensions({ width, height });
      setKonvaImage(img);
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
  }, [image]);

  // Apply filters to canvas image
  useEffect(() => {
    if (imageRef.current) {
      const activeFilters = [];

      // Always apply brightness and contrast
      activeFilters.push(window.Konva.Filters.Brighten);
      activeFilters.push(window.Konva.Filters.Contrast);

      // Add HSL for saturation
      if (saturation !== 100) {
        activeFilters.push(window.Konva.Filters.HSL);
      }

      // Add blur
      if (blur > 0) {
        activeFilters.push(window.Konva.Filters.Blur);
      }

      // Add color filters
      switch (selectedFilter) {
        case 'grayscale':
          activeFilters.push(window.Konva.Filters.Grayscale);
          break;
        case 'sepia':
          activeFilters.push(window.Konva.Filters.Sepia);
          break;
        case 'invert':
          activeFilters.push(window.Konva.Filters.Invert);
          break;
        case 'vintage':
          activeFilters.push(window.Konva.Filters.Sepia);
          activeFilters.push(window.Konva.Filters.Brighten);
          break;
        default:
          break;
      }

      // Apply all filters
      imageRef.current.cache();
      imageRef.current.filters(activeFilters);
      imageRef.current.brightness((brightness - 100) / 100);
      imageRef.current.contrast((contrast - 100) / 100);
      imageRef.current.saturation((saturation - 100) / 100);
      imageRef.current.blurRadius(blur);

      // Special handling for vintage
      if (selectedFilter === 'vintage') {
        imageRef.current.brightness(-0.2);
      }

      imageRef.current.getLayer()?.batchDraw();
    }
  }, [brightness, contrast, saturation, blur, selectedFilter]);

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSelectedFilter('none');
  };

  const handleDownload = () => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `edited_${image.filename}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!stageRef.current || isSaving) return;

    setIsSaving(true);
    try {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg', quality: 0.9 });
      // Convert base64 to blob
      const blob = await (await fetch(uri)).blob();

      if (onSave) {
        await onSave(image.id, blob);
      }
      onClose();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const enableTransform = () => {
    setIsTransforming(!isTransforming);
  };

  // Attach transformer to image when transform mode is enabled
  useEffect(() => {
    if (!imageRef.current || !transformerRef.current) return;

    if (isTransforming) {
      // Small delay to ensure everything is rendered
      setTimeout(() => {
        if (transformerRef.current && imageRef.current) {
          transformerRef.current.nodes([imageRef.current]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }, 50);
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isTransforming, konvaImage]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 lg:p-4">
      <div className="w-full h-full max-w-[100vw] lg:max-w-[95vw] max-h-[100vh] lg:max-h-[95vh] flex flex-col gap-2 lg:gap-4">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl lg:text-2xl font-bold text-white">Image Editor</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-4 overflow-hidden min-h-0">
          {/* Canvas Area */}
          <Card ref={containerRef} className="flex-1 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 overflow-auto p-2 lg:p-4 min-h-[40vh] lg:min-h-0">
            {konvaImage && (
              <div className="border-2 border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <Stage
                  ref={stageRef}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  style={{ display: 'block' }}
                >
                <Layer>
                  <KonvaImage
                    ref={imageRef}
                    image={konvaImage}
                    width={imageDimensions.width}
                    height={imageDimensions.height}
                    draggable={isTransforming}
                  />
                  {isTransforming && (
                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 50 || newBox.height < 50) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  )}
                </Layer>
              </Stage>
              </div>
            )}
          </Card>

          {/* Controls Panel - Bottom sheet on mobile, side panel on desktop */}
          <Card className="w-full lg:w-72 max-h-[50vh] lg:max-h-full overflow-y-auto space-y-3 lg:space-y-4 p-3 lg:p-4 shrink-0">
            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant={isTransforming ? "default" : "outline"}
                className="w-full"
                onClick={enableTransform}
              >
                <Crop className="w-4 h-4 mr-2" />
                {isTransforming ? 'Done Cropping' : 'Crop & Resize'}
              </Button>
            </div>

            {/* Adjustments */}
            <div className="space-y-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Sliders className="w-4 h-4" />
                <h3 className="font-semibold">Adjustments</h3>
              </div>

              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white/80">Brightness</label>
                  <span className="text-white">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 lg:h-2 touch-manipulation bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 lg:[&::-webkit-slider-thumb]:w-4 lg:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white/80">Contrast</label>
                  <span className="text-white">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2 lg:h-2 touch-manipulation bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 lg:[&::-webkit-slider-thumb]:w-4 lg:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white/80">Saturation</label>
                  <span className="text-white">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 lg:h-2 touch-manipulation bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 lg:[&::-webkit-slider-thumb]:w-4 lg:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Blur */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-white/80">Blur</label>
                  <span className="text-white">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full h-2 lg:h-2 touch-manipulation bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 lg:[&::-webkit-slider-thumb]:w-4 lg:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.name)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFilter === filter.name
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-white/20">
              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
