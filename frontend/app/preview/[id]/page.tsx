'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { websiteApi } from '@/lib/api';
import { GeneratedWebsite, ElementEdit } from '@/types';
import { ArrowLeft, Edit3 } from 'lucide-react';
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

  const handleSaveEdit = async (elementId: string, newContent: string) => {
    try {
      await websiteApi.saveEdit(websiteId, elementId, newContent);
      
      // Update local edits
      const newEdit: ElementEdit = {
        siteId: websiteId,
        elementId,
        content: newContent
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Website Preview</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Edit3 className="w-4 h-4 mr-1" />
                Click any element to edit
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onElementClick={setEditingElement}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {editingElement && (
        <EditModal
          elementId={editingElement.elementId}
          currentContent={editingElement.content}
          onSave={handleSaveEdit}
          onClose={() => setEditingElement(null)}
        />
      )}
    </div>
  );
}