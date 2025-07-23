'use client';

import { Info, Navigation, Edit, Eye } from 'lucide-react';

interface WebsiteInfoProps {
  pageCount: number;
  currentPage: string;
}

export default function WebsiteInfo({ pageCount, currentPage }: WebsiteInfoProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Your Website is Ready!</h3>
          <p className="text-gray-600 text-sm mb-4">
            AI has generated a complete website with {pageCount} pages. Each page includes a professional navbar, 
            footer, and navigation elements for seamless user experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-700">
              <Navigation className="w-4 h-4 mr-2 text-blue-600" />
              <span>Navigate between pages</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Edit className="w-4 h-4 mr-2 text-purple-600" />
              <span>Click elements to edit</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Eye className="w-4 h-4 mr-2 text-green-600" />
              <span>Preview in real-time</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Currently viewing:</span> {currentPage === 'index' ? 'Home' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
