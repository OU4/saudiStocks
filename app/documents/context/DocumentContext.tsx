"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  FinancialDocument, 
  DocumentQuery, 
  DocumentSearchResult 
} from '../types/document';
import FinancialDocumentStore from '../store/documentStore';
import { documentLoader } from '../utils/documentLoader';

interface DocumentContextType {
  searchDocuments: (query: DocumentQuery) => Promise<DocumentSearchResult[]>;
  loadDocument: (file: File) => Promise<FinancialDocument>;
  isLoading: boolean;
  error: string | null;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = FinancialDocumentStore.getInstance();

  const searchDocuments = async (query: DocumentQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await store.searchDocuments(query);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching documents');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocument = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const document = await documentLoader.loadDocument(file);
      return document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    searchDocuments,
    loadDocument,
    isLoading,
    error
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}