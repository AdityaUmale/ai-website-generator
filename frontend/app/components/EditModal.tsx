'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface EditModalProps {
  elementId: string;
  currentContent: string;
  currentStyles?: Record<string, any>;
  onSave: (elementId: string, newContent: string, newStyles?: Record<string, any>) => void;
  onClose: () => void;
}

export default function EditModal({ elementId, currentContent, currentStyles = {}, onSave, onClose }: EditModalProps) {
  const [content, setContent] = useState(currentContent);
  const [stylesText, setStylesText] = useState(
    Object.entries(currentStyles).map(([k, v]) => `${k}: ${v}`).join('\n')
  );

  const handleSave = () => {
    // Parse styles text into object
    const stylesObj: Record<string, any> = {};
    stylesText.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const prop = line.substring(0, colonIndex).trim();
        const val = line.substring(colonIndex + 1).trim();
        if (prop && val) {
          stylesObj[prop] = val;
        }
      }
    });
    onSave(elementId, content, stylesObj);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Element</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <label htmlFor="styles" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
            Inline Styles (property:value per line)
          </label>
          <textarea
            id="styles"
            value={stylesText}
            onChange={(e) => setStylesText(e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mt-1"
          />
        </div>
        
        <div className="flex justify-end space-x-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}