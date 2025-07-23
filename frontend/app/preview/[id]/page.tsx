'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { GeneratedWebsite, ElementEdit } from '@/types';
import { ArrowLeft, Edit3, Loader2, AlertCircle } from 'lucide-react';
import PageNavigation from '../../components/PageNavigation';
import WebsitePreview from '../../components/WebsitePreview';
import EditModal from '../../components/EditModal';


export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<GeneratedWebsite | null>(null);
  const [edits, setEdits] = useState<ElementEdit[]>([]);
  const [currentPage, setCurrentPage] = useState('index');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<{
    elementId: string;
    content: string;
    currentStyles: Record<string, any>;
  } | null>(null);

  useEffect(() => {
    if (websiteId) {
      loadWebsite();
    }
  }, [websiteId]);

  const loadWebsite = async () => {
    try {
      setLoading(true);
      const response = await websiteApi.getWebsite(websiteId);
      
      if (response.success && response.website) {
        setWebsite(response.website);
        setEdits(response.edits || []);
      } else {
        setError(response.error || 'Failed to load website');
      }
    } catch (err) {
      console.error('Failed to load website:', err);
      setError('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (elementId: string, newContent: string, newStyles?: Record<string, any>) => {
    try {
      await websiteApi.saveEdit(websiteId, elementId, newContent, newStyles);
      
      // Update local edits
      const newEdit: ElementEdit = {
        siteId: websiteId,
        elementId,
        content: newContent,
        styles: newStyles
      };
      
      setEdits(prev => {
        const existing = prev.find(e => e.elementId === elementId);
        if (existing) {
          return prev.map(e => e.elementId === elementId ? newEdit : e);
        }
        return [...prev, newEdit];
      });
      
      setEditingElement(null);
    } catch (err) {
      console.error('Failed to save edit:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <p className="text-red-700">{error || 'Website not found'}</p>
            </div>
            <button
              onClick={handleBack}
              className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Generator
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pageNames = Object.keys(website.pages);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-8 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Generator
              </button>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">Website Preview & Editor</h1>
                <p className="text-gray-600 mt-1">
                  Navigate between pages and click any element to edit content
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                <Edit3 className="w-4 h-4 mr-2" />
                <span>Click elements to edit</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{pageNames.length}</span> pages generated
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        
        <div className="flex gap-8">
          {/* Page Navigation */}
          <PageNavigation
            pages={pageNames}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* Website Preview */}
          <WebsitePreview
            website={website}
            currentPage={currentPage}
            edits={edits}
            onElementClick={(elementId, content, currentStyles) => setEditingElement({ elementId, content, currentStyles: currentStyles || {} })}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {editingElement && (
        <EditModal
          elementId={editingElement.elementId}
          currentContent={editingElement.content}
          currentStyles={editingElement.currentStyles}
          onSave={handleSaveEdit}
          onClose={() => setEditingElement(null)}
        />
      )}
    </div>
  );
}