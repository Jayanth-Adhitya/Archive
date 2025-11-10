import React, { useEffect, useState } from 'react';
import { Search, Trash2, Eye, Edit } from 'lucide-react';
import { useImagesStore } from '../../store/useImagesStore';
import { imagesAPI } from '../../lib/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageEditor from '../editor/ImageEditor';

const ImageGallery = ({ onImageSelect }) => {
  const {
    images,
    searchResults,
    searchQuery,
    isLoading,
    fetchImages,
    searchImages,
    deleteImage,
    clearSearch
  } = useImagesStore();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [editingImage, setEditingImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      searchImages(localSearchQuery);
    } else {
      clearSearch();
    }
  };

  const handleDelete = async (imageId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteImage(imageId);
    }
  };

  const handleEdit = (image, e) => {
    e.stopPropagation();
    setEditingImage(image);
  };

  const handleSaveEdit = async (imageId, blob) => {
    try {
      // Upload edited image to backend
      await imagesAPI.saveEdited(imageId, blob);
      setEditingImage(null);
      // Refresh images to show the new edited version
      await fetchImages();
    } catch (error) {
      console.error('Error saving edited image:', error);
      alert('Failed to save edited image. Please try again.');
    }
  };

  const displayImages = searchQuery ? searchResults : images;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search tags..."
            className="lg:placeholder:text-transparent"
            data-lg-placeholder="Search by tags (e.g., cat, beach, sunset)..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 lg:flex-none">
            <Search className="w-5 h-5 lg:mr-2" />
            <span className="lg:inline hidden">Search</span>
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 lg:flex-none"
              onClick={() => {
                setLocalSearchQuery('');
                clearSearch();
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Search Results Info */}
      {searchQuery && (
        <p className="text-white/80">
          Found {displayImages.length} images matching "{searchQuery}"
        </p>
      )}

      {/* Image Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-white/60">Loading images...</p>
        </div>
      ) : displayImages.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <p className="text-white/60">
            {searchQuery ? 'No images found' : 'No images yet. Upload your first image!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {displayImages.map((image) => (
            <div
              key={image.id}
              className="glass-card p-1 lg:p-2 group cursor-pointer hover:scale-105 transition-all duration-200"
              onClick={() => onImageSelect && onImageSelect(image)}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={image.file_path}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                {/* Desktop: hover overlay, Mobile: always visible at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:bg-black/50 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end lg:items-center justify-center pb-2 lg:pb-0">
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <Button
                      variant="glass"
                      size="icon"
                      className="w-10 h-10 lg:w-auto lg:h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageSelect && onImageSelect(image);
                      }}
                    >
                      <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button
                      variant="glass"
                      size="icon"
                      className="w-10 h-10 lg:w-auto lg:h-auto"
                      onClick={(e) => handleEdit(image, e)}
                    >
                      <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-10 h-10 lg:w-auto lg:h-auto"
                      onClick={(e) => handleDelete(image.id, e)}
                    >
                      <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Hide text on mobile, show on desktop */}
              <div className="hidden lg:block mt-2">
                <p className="text-white text-sm font-medium truncate">
                  {image.filename}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {image.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {image.tags?.length > 3 && (
                    <span className="text-xs text-white/60">
                      +{image.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ImageGallery;
