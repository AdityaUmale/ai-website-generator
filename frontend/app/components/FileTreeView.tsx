'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from 'lucide-react';

interface FileTreeViewProps {
  pages: string[];
  currentPage: string;
  onPageSelect: (page: string) => void;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
  page?: string;
}

export default function FileTreeView({ pages, currentPage, onPageSelect }: FileTreeViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['app', 'components']));

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
      return <File className="w-4 h-4 text-blue-500" />;
    }
    if (fileName.endsWith('.css')) {
      return <File className="w-4 h-4 text-green-500" />;
    }
    if (fileName.endsWith('.json')) {
      return <File className="w-4 h-4 text-yellow-500" />;
    }
    if (fileName.endsWith('.js')) {
      return <File className="w-4 h-4 text-yellow-600" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getFolderIcon = (folderName: string, isOpen: boolean) => {
    return isOpen ? 
      <FolderOpen className="w-4 h-4 text-blue-400" /> : 
      <Folder className="w-4 h-4 text-blue-400" />;
  };

  const buildFileTree = (): FileNode[] => {
    const tree: FileNode[] = [
      {
        name: 'app',
        type: 'folder',
        children: [
          {
            name: 'page.tsx',
            type: 'file',
            page: 'index'
          },
          ...pages.filter(page => page !== 'index').map(page => ({
            name: `${page}`,
            type: 'folder' as const,
            children: [{
              name: 'page.tsx',
              type: 'file' as const,
              page: page
            }]
          })),
          {
            name: 'layout.tsx',
            type: 'file'
          },
          {
            name: 'globals.css',
            type: 'file'
          }
        ]
      },
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Navbar.tsx', type: 'file' },
          { name: 'Footer.tsx', type: 'file' },
          { name: 'Layout.tsx', type: 'file' }
        ]
      },
      {
        name: 'public',
        type: 'folder',
        children: [
          { name: 'favicon.ico', type: 'file' },
          { name: 'images', type: 'folder', children: [] }
        ]
      },
      { name: 'package.json', type: 'file' },
      { name: 'tailwind.config.js', type: 'file' },
      { name: 'next.config.js', type: 'file' },
      { name: 'tsconfig.json', type: 'file' }
    ];
    return tree;
  };

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.name);
    const isCurrentFile = node.page === currentPage;
    
    return (
      <div key={node.name}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            isCurrentFile ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.name);
            } else if (node.page) {
              onPageSelect(node.page);
            }
          }}
        >
          {node.type === 'folder' && (
            <span className="mr-1">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          <span className="mr-2">
            {node.type === 'folder' 
              ? getFolderIcon(node.name, isExpanded)
              : getFileIcon(node.name)
            }
          </span>
          <span className="text-sm">{node.name}</span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const fileTree = buildFileTree();

  return (
    <div className="bg-gray-50 border-r border-gray-200 w-64 h-full overflow-y-auto">
      <div className="p-3 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-semibold text-gray-900">Explorer</h3>
      </div>
      <div className="p-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Project Files
        </div>
        {fileTree.map(node => renderFileNode(node))}
      </div>
    </div>
  );
}
