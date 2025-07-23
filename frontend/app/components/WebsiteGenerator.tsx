'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { GenerationResponse } from '@/types';
import { Loader2, Globe, Sparkles, AlertCircle } from 'lucide-react';

export default function WebsiteGenerator() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description for your website');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🎯 Starting website generation...');
      const response: GenerationResponse = await websiteApi.generateWebsite({
        description: description.trim()
      });

      console.log('✅ Generation response:', response);

      if (response.success && response.website) {
        console.log('🚀 Navigating to preview page:', response.website.id);
        router.push(`/preview/${response.website.id}`);
      } else {
        setError(response.error || 'Failed to generate website');
      }
    } catch (err: any) {
      console.error('❌ Generation failed:', err);
      
      let errorMessage = 'Failed to generate website. Please try again.';
      
      if (err.message?.includes('timeout')) {
        errorMessage = 'The AI is taking too long to respond. Please try with a shorter description or try again later.';
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">AI Website Generator</h1>
        </div>
        <p className="text-gray-600">
          Describe your ideal website and watch AI bring it to life
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Website Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., I want a website for a mindfulness coach with 3 pages: Home, About, Contact. It should have a calming design with nature colors..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isGenerating}
        />

        {error && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Tip: Try a shorter, more specific description if the request is timing out.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Website... (This may take up to 2 minutes)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Website
            </>
          )}
        </button>

        {isGenerating && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              🤖 AI is working on your website... This usually takes 30-60 seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}