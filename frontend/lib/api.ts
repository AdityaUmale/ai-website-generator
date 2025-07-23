import axios from 'axios';
import { GenerationRequest, GenerationResponse, WebsiteResponse, PageResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased to 2 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const websiteApi = {
  generateWebsite: async (request: GenerationRequest): Promise<GenerationResponse> => {
    try {
      console.log('🎯 Generating website with request:', request);
      const response = await api.post('/api/website/generate', request);
      return response.data;
    } catch (error: any) {
      console.error('Generate website error:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - the AI is taking too long to respond. Please try again.');
      }
      
      if (error.response?.status === 500) {
        throw new Error(error.response.data?.details || 'Server error occurred');
      }
      
      throw error;
    }
  },

  getWebsite: async (id: string): Promise<WebsiteResponse> => {
    try {
      const response = await api.get(`/api/website/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get website error:', error);
      throw error;
    }
  },

  getPage: async (id: string, pageName: string): Promise<PageResponse> => {
    try {
      const response = await api.get(`/api/website/${id}/page/${pageName}`);
      return response.data;
    } catch (error) {
      console.error('Get page error:', error);
      throw error;
    }
  },

  saveEdit: async (id: string, elementId: string, content?: string, styles?: Record<string, any>) => {
    try {
      const response = await api.post(`/api/website/${id}/edit`, {
        elementId,
        content,
        styles
      });
      return response.data;
    } catch (error) {
      console.error('Save edit error:', error);
      throw error;
    }
  },

  getAllWebsites: async () => {
    try {
      const response = await api.get('/api/website');
      return response.data;
    } catch (error) {
      console.error('Get all websites error:', error);
      throw error;
    }
  }
};