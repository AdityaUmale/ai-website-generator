import { GeneratedWebsite, ElementEdit } from '../types/website';

// Simple in-memory storage for MVP
class StorageService {
  private websites: Map<string, GeneratedWebsite> = new Map();
  private edits: Map<string, ElementEdit[]> = new Map();

  saveWebsite(website: GeneratedWebsite): void {
    this.websites.set(website.id, website);
  }

  getWebsite(id: string): GeneratedWebsite | undefined {
    return this.websites.get(id);
  }

  saveEdit(edit: ElementEdit): void {
    const existingEdits = this.edits.get(edit.siteId) || [];
    const editIndex = existingEdits.findIndex(e => e.elementId === edit.elementId);
    
    if (editIndex >= 0) {
      existingEdits[editIndex] = edit;
    } else {
      existingEdits.push(edit);
    }
    
    this.edits.set(edit.siteId, existingEdits);
  }

  getEdits(siteId: string): ElementEdit[] {
    return this.edits.get(siteId) || [];
  }

  getAllWebsites(): GeneratedWebsite[] {
    return Array.from(this.websites.values());
  }
}

export const storageService = new StorageService();