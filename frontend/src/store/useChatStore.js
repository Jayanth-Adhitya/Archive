import { create } from 'zustand';
import { chatAPI } from '../lib/api';

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (message) => {
    const userMessage = { role: 'user', content: message };

    // Add user message to chat
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const conversationHistory = get().messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatAPI.sendMessage(message, conversationHistory);

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        suggestedImages: response.data.suggested_images,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send message';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  assistWithTask: async (taskDescription) => {
    set({ isLoading: true, error: null });

    try {
      const response = await chatAPI.assistWithTask(taskDescription);

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        task: taskDescription,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to get assistance';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  analyzeImage: async (imageId, query) => {
    set({ isLoading: true, error: null });

    try {
      const response = await chatAPI.analyzeImage(imageId, query);

      const assistantMessage = {
        role: 'assistant',
        content: response.data.analysis,
        imageId: imageId,
        query: query,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to analyze image';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearMessages: () => set({ messages: [] }),

  clearError: () => set({ error: null }),
}));
