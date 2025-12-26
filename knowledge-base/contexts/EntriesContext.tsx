'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ExtractedEntry } from '@/lib/types';

interface EntriesContextType {
  extractedEntries: ExtractedEntry[];
  setExtractedEntries: (entries: ExtractedEntry[]) => void;
  reviewedEntries: ExtractedEntry[];
  setReviewedEntries: (entries: ExtractedEntry[]) => void;
  sourceReference: string;
  setSourceReference: (source: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  clearAll: () => void;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [extractedEntries, setExtractedEntries] = useState<ExtractedEntry[]>([]);
  const [reviewedEntries, setReviewedEntries] = useState<ExtractedEntry[]>([]);
  const [sourceReference, setSourceReference] = useState('');
  const [userName, setUserName] = useState('');

  const clearAll = () => {
    setExtractedEntries([]);
    setReviewedEntries([]);
    setSourceReference('');
  };

  return (
    <EntriesContext.Provider
      value={{
        extractedEntries,
        setExtractedEntries,
        reviewedEntries,
        setReviewedEntries,
        sourceReference,
        setSourceReference,
        userName,
        setUserName,
        clearAll,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
}


