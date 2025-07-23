'use client';

import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { GeneratedWebsite, ElementEdit } from '@/types';
import { Eye, Code } from 'lucide-react';
import * as Babel from '@babel/standalone';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import prettier from 'prettier/standalone';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import FileTreeView from './FileTreeView';

interface WebsitePreviewProps {
  website: GeneratedWebsite;
  currentPage: string;
  edits: ElementEdit[];
  onElementClick: Dispatch<SetStateAction<{ elementId: string; content: string; } | null>>;
  onPageChange?: (pageName: string) => void;
}

export default function WebsitePreview({ 
  website, 
  currentPage, 
  edits, 
  onElementClick,
  onPageChange 
}: WebsitePreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [formattedCode, setFormattedCode] = useState<string>('');

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

  // Handle navigation clicks within the generated website
  const handleNavigationClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const navPage = target.getAttribute('data-nav-page') || target.closest('[data-nav-page]')?.getAttribute('data-nav-page');
    
    if (navPage && onPageChange) {
      event.preventDefault();
      event.stopPropagation();
      
      // Convert page names to match the website structure
      let targetPage = navPage.toLowerCase();
      if (targetPage === 'home') targetPage = 'index';
      
      // Check if the page exists in the website
      if (website.pages[targetPage]) {
        onPageChange(targetPage);
      }
    }
  };

  const currentPageContent = website.pages[currentPage];

  useEffect(() => {
    const formatCode = async () => {
      try {
        // Get the page name for proper file naming
        const pageName = currentPage === 'index' ? 'page' : currentPage;
        const pageDisplayName = currentPage === 'index' ? 'Home' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
        
        // Format the original component content
        const formattedOriginal = await prettier.format(currentPageContent, {
          parser: 'babel',
          plugins: [babel.default, estree.default],
          semi: true,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 80,
        });

        // Create minimalist Next.js page code without leaking internal prompts
        const pageCode = `'use client';

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${pageDisplayName} | Your Website',
  description: 'AI generated page',
};

const ${pageDisplayName}Page = ${formattedOriginal};

export default ${pageDisplayName}Page;`;

        setFormattedCode(pageCode);
      } catch (error) {
        console.error('Formatting error:', error);
        // Fallback with basic structure
        const fallbackCode = `'use client';

import React from 'react';

const Page = ${currentPageContent};

export default Page;`;
        setFormattedCode(fallbackCode);
      }
    };

    if (currentPageContent) {
      formatCode();
    }
  }, [currentPageContent, currentPage]);

  if (!currentPageContent) {
    return (
      <div className="flex-1 bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Page not found</p>
      </div>
    );
  }

  let DynamicPage;
  try {
    const transpiled = Babel.transform(currentPageContent, {
      presets: ['react'],
    }).code;

    const ComponentFn = new Function('React', `return ${transpiled}`);
    DynamicPage = ComponentFn(React);
  } catch (err) {
    console.error('JSX render error:', err);
    return <div>Error rendering page</div>;
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'preview' ? 'code' : 'preview');
  };

  return (
    <>
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {viewMode === 'preview' ? (
                  <Eye className="w-4 h-4 mr-2 text-gray-500" />
                ) : (
                  <Code className="w-4 h-4 mr-2 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {currentPage === 'index' ? 'Home' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Mode
                </span>
              </div>
              <button
                onClick={toggleViewMode}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Switch to {viewMode === 'preview' ? 'Code' : 'Preview'}
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {viewMode === 'preview' ? (
              <div 
                className="preview-container bg-white min-h-96"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  
                  // Handle navigation clicks first
                  const navPage = target.getAttribute('data-nav-page') || target.closest('[data-nav-page]')?.getAttribute('data-nav-page');
                  if (navPage && onPageChange) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let targetPage = navPage.toLowerCase();
                    if (targetPage === 'home') targetPage = 'index';
                    
                    if (website.pages[targetPage]) {
                      onPageChange(targetPage);
                      return;
                    }
                  }
                  
                  // Handle editable element clicks
                  const editableElement = target.closest('.editable-element') as HTMLElement;
                  if (editableElement) {
                    const elementId = editableElement.getAttribute('data-edit-id');
                    if (elementId) {
                      const content = editableElement.textContent || '';
                      onElementClick({ elementId, content });
                    }
                  }
                }}
              >
                <DynamicPage />
              </div>
            ) : (
              <div className="flex h-[600px] bg-gray-900 rounded-lg overflow-hidden">
                {/* File Tree Sidebar */}
                <FileTreeView 
                  pages={Object.keys(website.pages)}
                  currentPage={currentPage}
                  onPageSelect={(page) => onPageChange && onPageChange(page)}
                />
                
                {/* Code Editor Area */}
                <div className="flex-1 flex flex-col">
                  {/* IDE Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 text-xs font-mono">
                        app/{currentPage === 'index' ? 'page.tsx' : `${currentPage}/page.tsx`}
                      </span>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="flex-1 overflow-auto">
                    <SyntaxHighlighter
                      language="typescript"
                      style={vscDarkPlus}
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        background: 'transparent',
                        fontSize: '13px',
                        height: '100%',
                      }}
                      children={formattedCode}
                    />
                  </div>
                </div>
              </div>
            )}
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
        
        /* Navigation element styles */
        [data-nav-page] {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        [data-nav-page]:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        /* Prevent text selection on navigation elements */
        [data-nav-page] {
          user-select: none;
        }
      `}</style>
    </>
  );
}