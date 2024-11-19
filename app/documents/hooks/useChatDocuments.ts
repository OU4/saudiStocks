import { useState, useCallback } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { DocumentSearchResult, DocumentQuery } from '../types/document';

interface ChatDocumentContext {
  relevantDocuments: DocumentSearchResult[];
  documentContext: string;
  confidence: number;
}

export function useChatDocuments() {
  const { searchDocuments } = useDocuments();
  const [lastContext, setLastContext] = useState<ChatDocumentContext | null>(null);

  const getDocumentContext = useCallback(async (message: string): Promise<ChatDocumentContext> => {
    // Extract key terms and topics from the message
    const query: DocumentQuery = {
      searchTerm: message,
      limit: 5 // Limit to most relevant documents
    };

    try {
      // Search for relevant documents
      const relevantDocs = await searchDocuments(query);

      // Build context from relevant documents
      const context = buildDocumentContext(relevantDocs);

      // Calculate confidence based on relevance scores
      const confidence = calculateContextConfidence(relevantDocs);

      const result = {
        relevantDocuments: relevantDocs,
        documentContext: context,
        confidence
      };

      setLastContext(result);
      return result;

    } catch (error) {
      console.error('Error getting document context:', error);
      return {
        relevantDocuments: [],
        documentContext: '',
        confidence: 0
      };
    }
  }, [searchDocuments]);

  const buildDocumentContext = (documents: DocumentSearchResult[]): string => {
    let context = '';

    documents.forEach((doc, index) => {
      // Add document metadata
      context += `[Document ${index + 1}: ${doc.document.metadata.title}]\n`;
      
      // Add matched segments if available
      if (doc.matchedSegments.length > 0) {
        context += 'Relevant excerpts:\n';
        doc.matchedSegments.forEach(segment => {
          context += `- ${segment}\n`;
        });
      } else {
        // If no specific matches, add document summary
        const summary = summarizeDocument(doc.document.content);
        context += `Summary: ${summary}\n`;
      }
      
      context += '\n';
    });

    return context;
  };

  const summarizeDocument = (content: string): string => {
    // Simple summarization - take first few sentences
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    return sentences.slice(0, 2).join('. ') + '.';
  };

  const calculateContextConfidence = (documents: DocumentSearchResult[]): number => {
    if (documents.length === 0) return 0;

    // Average relevance scores
    const avgRelevance = documents.reduce((sum, doc) => 
      sum + doc.relevanceScore, 0) / documents.length;

    // Consider number of documents found
    const coverageScore = Math.min(documents.length / 5, 1); // Max score with 5 docs

    return (avgRelevance * 0.7 + coverageScore * 0.3);
  };

  return {
    getDocumentContext,
    lastContext
  };
}