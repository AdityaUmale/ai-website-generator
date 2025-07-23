'use client';
import { Dispatch, SetStateAction } from 'react';
import { Home, Info, Briefcase, Mail, ChevronRight } from 'lucide-react';

interface PageNavigationProps {
  pages: string[];
  currentPage: string;
  onPageChange: Dispatch<SetStateAction<string>>;
}

const getPageIcon = (pageName: string) => {
  switch (pageName.toLowerCase()) {
    case 'index':
    case 'home':
      return <Home className="w-4 h-4" />;
    case 'about':
      return <Info className="w-4 h-4" />;
    case 'services':
      return <Briefcase className="w-4 h-4" />;
    case 'contact':
      return <Mail className="w-4 h-4" />;
    default:
      return <ChevronRight className="w-4 h-4" />;
  }
};

const getPageDisplayName = (pageName: string) => {
  if (pageName === 'index') return 'Home';
  return pageName.charAt(0).toUpperCase() + pageName.slice(1);
};

export default function PageNavigation({ pages, currentPage, onPageChange }: PageNavigationProps) {
  return (
    <div className="w-72 bg-white rounded-md border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center mr-3">
          <Home className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-gray-900">Website Pages</h3>
      </div>
      
      <nav className="space-y-1">
        {pages.map((pageName) => {
          const isActive = currentPage === pageName;
          return (
            <button
              key={pageName}
              onClick={() => onPageChange(pageName)}
              className={`w-full group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {getPageIcon(pageName)}
              </span>
              <span className="flex-1 text-left">
                {getPageDisplayName(pageName)}
              </span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click any page to preview and edit
        </p>
      </div>
    </div>
  );
}