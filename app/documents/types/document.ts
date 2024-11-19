export type DocumentCategory = 
  | 'regulation'
  | 'profile'
  | 'research'
  | 'educational'
  | 'market-update';

export type DocumentLanguage = 'en' | 'ar';

export interface DocumentMetadata {
  id: string;
  title: string;
  category: DocumentCategory;
  tags: string[];
  language: DocumentLanguage;
  lastUpdated: string;
  source: string;
  version: string;
}

export interface FinancialDocument {
  metadata: DocumentMetadata;
  content: string;
  path: string;
}

export interface DocumentSearchResult {
  document: FinancialDocument;
  relevanceScore: number;
  matchedSegments: string[];
}

export interface DocumentContext {
  relevantDocuments: DocumentSearchResult[];
  confidence: number;
  context: string;
}

export interface DocumentStore {
  documents: Map<string, FinancialDocument>;
  indexes: {
    byCategory: Map<DocumentCategory, string[]>;
    byTag: Map<string, string[]>;
    byLanguage: Map<DocumentLanguage, string[]>;
  };
}

export interface DocumentQuery {
  searchTerm?: string;
  category?: DocumentCategory;
  tags?: string[];
  language?: DocumentLanguage;
  limit?: number;
}