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

  const currentPageContent = website.pages[currentPage];

  useEffect(() => {
    const formatCode = async () => {
      try {
        // First, format the original content
        const formattedOriginal = await prettier.format(currentPageContent, {
          parser: 'babel',
          plugins: [babel.default, estree.default],
          semi: true,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 80,
        });
    
        // Wrap in Next.js page structure
        const wrappedCode = `'use client';
    
        import React from 'react';
        // Add other common imports as needed, e.g.
        // import Link from 'next/link';
        // import Image from 'next/image';
    
        const Page = ${formattedOriginal};
    
        export default Page;`;
    
        // Format the wrapped code
        const formattedWrapped = await prettier.format(wrappedCode, {
          parser: 'babel',
          plugins: [babel.default, estree.default],
          semi: true,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 80,
        });
    
        setFormattedCode(formattedWrapped);
      } catch (error) {
        console.error('Formatting error:', error);
        setFormattedCode(currentPageContent); // Fallback
      }
    };
  
    if (currentPageContent) {
      formatCode();
    }
  }, [currentPageContent]);

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
            // The code view remains the same, now using the defined formattedCode
            {viewMode === 'preview' ? (
              <div className="preview-container bg-white min-h-96">
                <DynamicPage />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-auto max-h-96">
                <SyntaxHighlighter
                  language="jsx"
                  style={vscDarkPlus}
                  showLineNumbers
                  children={formattedCode}
                />
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
      `}</style>
    </>
  );
}