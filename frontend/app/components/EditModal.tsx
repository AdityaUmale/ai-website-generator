'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface EditModalProps {
  elementId: string;
  currentContent: string;
  onSave: (elementId: string, newContent: string) => void;
  onClose: () => void;
}

export default function EditModal({ elementId, currentContent, onSave, onClose }: EditModalProps) {
  const [content, setContent] = useState(currentContent);

  const handleSave = () => {
    onSave(elementId, content);
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