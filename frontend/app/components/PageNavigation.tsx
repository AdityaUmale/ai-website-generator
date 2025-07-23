'use client';

import { Dispatch, SetStateAction } from 'react';

interface PageNavigationProps {
  pages: string[];
  currentPage: string;
  onPageChange: Dispatch<SetStateAction<string>>;
}

export default function PageNavigation({ pages, currentPage, onPageChange }: PageNavigationProps) {
  return (
    <div className="w-64 bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Pages</h3>
      <nav className="space-y-1">
        {pages.map((pageName) => (
          <button
            key={pageName}
            onClick={() => onPageChange(pageName)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              currentPage === pageName
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {pageName === 'index' ? 'Home' : pageName.charAt(0).toUpperCase() + pageName.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
}