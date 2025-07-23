export interface GenerationRequest {
  description: string;
  pages?: string[];
  style?: string;
}

export interface GenerationResponse {
  success: boolean;
  website?: {
    id: string;
    pages: string[];
    timestamp: Date;
  };
  error?: string;
  details?: string;
}

export interface GeneratedWebsite {
  id: string;
  pages: Record<string, string>;
  styles: string;
  timestamp: Date;
}

export interface WebsiteResponse {
  success: boolean;
  website?: GeneratedWebsite;
  edits?: ElementEdit[];
  error?: string;
}

export interface ElementEdit {
  siteId: string;
  elementId: string;
  content?: string;
  styles?: Record<string, any>;
}

export interface PageResponse {
  success: boolean;
  content?: string;
  styles?: string;
  error?: string;
}