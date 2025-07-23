'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { GeneratedWebsite, ElementEdit } from '@/types';
import { ArrowLeft, Edit3 } from 'lucide-react';
import PageNavigation from '../../components/PageNavigation';
import WebsitePreview from '../../components/WebsitePreview';
import EditModal from '../../components/EditModal';
import WebsiteInfo from '../../components/WebsiteInfo';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">
          <p>{error || 'Website not found'}</p>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const pageNames = Object.keys(website.pages);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Generator
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Website Preview & Editor</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Navigate between pages and click any element to edit content
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                <Edit3 className="w-4 h-4 mr-2 text-blue-600" />
                <span>Click elements to edit</span>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{pageNames.length}</span> pages generated
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Website Info */}
        <WebsiteInfo pageCount={pageNames.length} currentPage={currentPage} />
        
        <div className="flex gap-6">
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