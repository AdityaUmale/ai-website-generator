'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { GenerationResponse } from '@/types';
import { Loader2, Globe, Sparkles, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              AI Website Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Describe your dream website and watch AI create a complete, professional website with 
            navigation, multiple pages, and modern design in seconds.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Generation Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex items-center mb-6">
              <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Create Your Website</h2>
            </div>
            
            <div className="space-y-6">
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
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Generating your website...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Generate Website
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Need inspiration? Try these examples:</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  disabled={isGenerating}
                >
                  <p className="text-sm text-gray-700 group-hover:text-blue-700">
                    "{example}"
                  </p>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">💡 Pro tip:</span> Be specific about your business type, desired pages, 
                and any special features you want. The AI will create a complete website with navbar, footer, 
                and professional navigation between pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}