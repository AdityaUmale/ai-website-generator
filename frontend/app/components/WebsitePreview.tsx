'use client';

import { Dispatch, SetStateAction } from 'react';
import { GeneratedWebsite, ElementEdit } from '@/types';
import { Eye } from 'lucide-react';

interface WebsitePreviewProps {
  website: GeneratedWebsite;
  currentPage: string;
  edits: ElementEdit[];
  onElementClick: Dispatch<SetStateAction<{ elementId: string; content: string; } | null>>;
}

export default function WebsitePreview({ 
  website, 
  currentPage, 
  edits, 
  onElementClick 
}: WebsitePreviewProps) {
  const applyEdits = (content: string): string => {
    let modifiedContent = content;
    
    edits.forEach(edit => {
      if (edit.content) {
        const regex = new RegExp(
          `(<[^>]*data-edit-id="${edit.elementId}"[^>]*>)([^<]*)(</[^>]*>)`,
          'g'
        );
        modifiedContent = modifiedContent.replace(regex, `$1${edit.content}$3`);
      }
    });
    
    return modifiedContent;
  };

  const makeElementsEditable = (content: string): string => {
    return content.replace(
      /data-edit-id="([^"]*)"([^>]*)>/g,
      (match, editId, attributes) => {
        return `data-edit-id="${editId}"${attributes} class="editable-element">`;
      }
    );
  };

  const currentPageContent = website.pages[currentPage];

  if (!currentPageContent) {
    return (
      <div className="flex-1 bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Page not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {currentPage === 'index' ? 'Home' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="preview-container bg-white min-h-96">
              <div
                dangerouslySetInnerHTML={{
                  __html: makeElementsEditable(applyEdits(currentPageContent))
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const editId = target.getAttribute('data-edit-id');
                  if (editId) {
                    e.preventDefault();
                    onElementClick({ 
                      elementId: editId, 
                      content: target.textContent || '' 
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inject styles */}
      <style jsx global>{`
        ${website.styles}
        
        .editable-element:hover {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          cursor: pointer;
        }
        
        .editable-element:hover::after {
          content: 'Click to edit';
          position: absolute;
          top: -30px;
          right: 0;
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 10;
        }
      `}</style>
    </>
  );
}