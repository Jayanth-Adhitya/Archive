import { create } from 'zustand';
import { imagesAPI } from '../lib/api';

export const useImagesStore = create((set, get) => ({
  images: [],
  selectedImage: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  searchQuery: '',
  searchResults: [],

  fetchImages: async (skip = 0, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await imagesAPI.list(skip, limit);
      set({ images: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  uploadImage: async (file) => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    try {
      const response = await imagesAPI.upload(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        set({ uploadProgress: percentCompleted });
      });

      // Add new image to the list
      const newImage = response.data.image;
      set((state) => ({
        images: [newImage, ...state.images],
        isUploading: false,
        uploadProgress: 0,
      }));

      return { success: true, image: newImage };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      set({ error: errorMessage, isUploading: false, uploadProgress: 0 });
      return { success: false, error: errorMessage };
    }
  },

  deleteImage: async (imageId) => {
    try {
      await imagesAPI.delete(imageId);
      set((state) => ({
        images: state.images.filter((img) => img.id !== imageId),
        selectedImage: state.selectedImage?.id === imageId ? null : state.selectedImage,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Delete failed';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  searchImages: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: '' });
      return;
    }

    set({ isLoading: true, searchQuery: query });
    try {
      const response = await imagesAPI.searchByTags(query);
      set({ searchResults: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectImage: (image) => set({ selectedImage: image }),

  clearSearch: () => set({ searchResults: [], searchQuery: '' }),

  clearError: () => set({ error: null }),
}));
