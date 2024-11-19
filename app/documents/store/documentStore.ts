import { 
    DocumentStore, 
    FinancialDocument, 
    DocumentCategory, 
    DocumentQuery,
    DocumentSearchResult
  } from '../types/document';
  
  export class FinancialDocumentStore {
    private store: DocumentStore;
    private static instance: FinancialDocumentStore;
  
    private constructor() {
      this.store = {
        documents: new Map(),
        indexes: {
          byCategory: new Map(),
          byTag: new Map(),
          byLanguage: new Map()
        }
      };
    }
  
    static getInstance(): FinancialDocumentStore {
      if (!FinancialDocumentStore.instance) {
        FinancialDocumentStore.instance = new FinancialDocumentStore();
      }
      return FinancialDocumentStore.instance;
    }
  
    async addDocument(document: FinancialDocument) {
      // Add to main store
      this.store.documents.set(document.metadata.id, document);
  
      // Update indexes
      this.updateIndexes(document);
    }
  
    private updateIndexes(document: FinancialDocument) {
      // Update category index
      const categoryDocs = this.store.indexes.byCategory.get(document.metadata.category) || [];
      this.store.indexes.byCategory.set(
        document.metadata.category,
        [...categoryDocs, document.metadata.id]
      );
  
      // Update tag index
      document.metadata.tags.forEach(tag => {
        const tagDocs = this.store.indexes.byTag.get(tag) || [];
        this.store.indexes.byTag.set(tag, [...tagDocs, document.metadata.id]);
      });
  
      // Update language index
      const langDocs = this.store.indexes.byLanguage.get(document.metadata.language) || [];
      this.store.indexes.byLanguage.set(
        document.metadata.language,
        [...langDocs, document.metadata.id]
      );
    }
  
    async searchDocuments(query: DocumentQuery): Promise<DocumentSearchResult[]> {
      const results: DocumentSearchResult[] = [];
      
      // Get initial document set based on filters
      let documentSet = this.getFilteredDocuments(query);
  
      // If search term exists, perform text search
      if (query.searchTerm) {
        documentSet = this.performTextSearch(documentSet, query.searchTerm);
      }
  
      // Convert to search results with relevance scores
      documentSet.forEach(doc => {
        results.push({
          document: doc,
          relevanceScore: this.calculateRelevanceScore(doc, query),
          matchedSegments: this.findMatchedSegments(doc, query.searchTerm)
        });
      });
  
      // Sort by relevance and apply limit
      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, query.limit || results.length);
    }
  
    private getFilteredDocuments(query: DocumentQuery): FinancialDocument[] {
      let documents = Array.from(this.store.documents.values());
  
      if (query.category) {
        documents = documents.filter(doc => 
          doc.metadata.category === query.category
        );
      }
  
      if (query.tags?.length) {
        documents = documents.filter(doc =>
          query.tags!.some(tag => doc.metadata.tags.includes(tag))
        );
      }
  
      if (query.language) {
        documents = documents.filter(doc =>
          doc.metadata.language === query.language
        );
      }
  
      return documents;
    }
  
    private performTextSearch(
      documents: FinancialDocument[], 
      searchTerm: string
    ): FinancialDocument[] {
      const normalizedSearch = searchTerm.toLowerCase();
      return documents.filter(doc => {
        // Search in content
        if (doc.content.toLowerCase().includes(normalizedSearch)) {
          return true;
        }
        // Search in metadata
        if (doc.metadata.title.toLowerCase().includes(normalizedSearch)) {
          return true;
        }
        // Search in tags
        if (doc.metadata.tags.some(tag => 
          tag.toLowerCase().includes(normalizedSearch))
        ) {
          return true;
        }
        return false;
      });
    }
  
    private calculateRelevanceScore(
      document: FinancialDocument, 
      query: DocumentQuery
    ): number {
      let score = 1;
  
      if (query.searchTerm) {
        // Calculate text match relevance
        const termFrequency = this.calculateTermFrequency(
          document.content,
          query.searchTerm
        );
        score *= (1 + termFrequency);
      }
  
      // Boost score based on recency
      const docAge = Date.now() - new Date(document.metadata.lastUpdated).getTime();
      const recencyBoost = 1 + (1 / (1 + docAge / (1000 * 60 * 60 * 24))); // Decay over days
      score *= recencyBoost;
  
      return score;
    }
  
    private calculateTermFrequency(text: string, term: string): number {
      const regex = new RegExp(term, 'gi');
      const matches = text.match(regex);
      return matches ? matches.length / text.length : 0;
    }
  
    private findMatchedSegments(
      document: FinancialDocument, 
      searchTerm?: string
    ): string[] {
      if (!searchTerm) return [];
  
      const segments: string[] = [];
      const regex = new RegExp(`(.{0,50}${searchTerm}.{0,50})`, 'gi');
      let match;
  
      while ((match = regex.exec(document.content)) !== null) {
        segments.push(match[1]);
      }
  
      return segments;
    }
  
    getDocumentById(id: string): FinancialDocument | undefined {
      return this.store.documents.get(id);
    }
  
    getDocumentsByCategory(category: DocumentCategory): FinancialDocument[] {
      const docIds = this.store.indexes.byCategory.get(category) || [];
      return docIds
        .map(id => this.store.documents.get(id))
        .filter((doc): doc is FinancialDocument => doc !== undefined);
    }
  }
  
  export default FinancialDocumentStore;