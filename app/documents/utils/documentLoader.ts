import { FinancialDocument, DocumentCategory, DocumentMetadata } from '../types/document';
import FinancialDocumentStore from '../store/documentStore';

export class DocumentLoader {
  private store: FinancialDocumentStore;

  constructor() {
    this.store = FinancialDocumentStore.getInstance();
  }

  async loadDocument(file: File): Promise<FinancialDocument> {
    try {
      // Read file content
      const content = await this.readFileContent(file);
      
      // Generate metadata
      const metadata = await this.generateMetadata(file);
      
      // Create document
      const document: FinancialDocument = {
        metadata,
        content,
        path: file.name,
      };

      // Add to store
      await this.store.addDocument(document);

      return document;
    } catch (error) {
      console.error('Error loading document:', error);
      throw error;
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = (e) => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  private async generateMetadata(file: File): Promise<DocumentMetadata> {
    // Extract category from file path/name
    const category = this.determineCategory(file.name);
    
    // Generate unique ID
    const id = this.generateDocumentId(file.name);

    return {
      id,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      category,
      tags: this.generateTags(file.name, category),
      language: this.determineLanguage(file.name),
      lastUpdated: new Date().toISOString(),
      source: 'local',
      version: '1.0'
    };
  }

  private determineCategory(filename: string): DocumentCategory {
    // Implement logic to determine category based on filename or path
    if (filename.includes('regulation')) return 'regulation';
    if (filename.includes('profile')) return 'profile';
    if (filename.includes('research')) return 'research';
    if (filename.includes('educational')) return 'educational';
    return 'market-update';
  }

  private generateDocumentId(filename: string): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTags(filename: string, category: DocumentCategory): string[] {
    const tags = new Set<string>();
    
    // Add category as tag
    tags.add(category);
    
    // Add filename-based tags
    const words = filename
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 3);
    
    words.forEach(word => tags.add(word));
    
    return Array.from(tags);
  }

  private determineLanguage(filename: string): 'en' | 'ar' {
    // Simple language detection based on filename
    // Enhance this based on your needs
    return filename.includes('_ar') ? 'ar' : 'en';
  }
}

export const documentLoader = new DocumentLoader();