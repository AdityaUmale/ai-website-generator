export interface WebsiteDescription {
  description: string;
  pages?: string[];
  style?: 'modern' | 'classic' | 'minimal';
}

export interface GeneratedWebsite {
  id: string;
  pages: Record<string, string>;
  components?: Record<string, string>;
  styles: string;
  timestamp: Date;
}

export interface ElementEdit {
  siteId: string;
  elementId: string;
  content?: string;
  styles?: Record<string, any>;
}

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

export interface WebsiteResponse {
  success: boolean;
  website?: GeneratedWebsite;
  edits?: ElementEdit[];
  error?: string;
}

export interface PageResponse {
  success: boolean;
  content?: string;
  styles?: string;
  error?: string;
}

export interface EditRequest {
  elementId: string;
  content?: string;
  styles?: Record<string, any>;
}

export interface EditResponse {
  success: boolean;
  error?: string;
}