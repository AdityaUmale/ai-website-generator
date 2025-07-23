'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { GenerationResponse } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function WebsiteGenerator() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const examplePrompts = [
    "A modern pet adoption website called Pet Paradise with home, about, services, and contact pages",
    "A professional restaurant website with menu, reservations, about us, and contact information",
    "A fitness gym website with class schedules, membership plans, trainer profiles, and contact details",
    "A tech startup landing page with product features, pricing, team, and contact sections"
  ];

  const handleExampleClick = (example: string) => {
    setDescription(example);
    setError(null);
  };

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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">
            AI Website Generator
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
            Describe your dream website and we'll create a complete, professional website with 
            navigation, multiple pages, and modern design in seconds.
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-8">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
              Describe your website
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
              placeholder="e.g., A modern pet adoption website with home, about, services, and contact pages..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
              rows={4}
              disabled={isGenerating}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating your website...
              </>
            ) : (
              'Generate Website'
            )}
          </button>

          {error && (
            <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Need inspiration? Try these examples:
          </h3>
          <div className="space-y-3">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left p-3 text-sm text-gray-600 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={isGenerating}
              >
                "{example}"
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">💡 Pro tip:</span> Be specific about your business type, desired pages, 
              and any special features you want. The AI will create a complete website with navbar, footer, 
              and professional navigation between pages.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}