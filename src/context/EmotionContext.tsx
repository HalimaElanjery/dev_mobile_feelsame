/**
 * Contexte émotionnel
 * Gère l'état de l'émotion et de la situation sélectionnées par l'utilisateur
 */

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface EmotionContextType {
  selectedEmotion: string | null;
  selectedSituation: string | null;
  setSelectedEmotion: (emotion: string | null) => void;
  setSelectedSituation: (situation: string | null) => void;
  resetSelection: () => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);

  const resetSelection = () => {
    setSelectedEmotion(null);
    setSelectedSituation(null);
  };

  const value: EmotionContextType = {
    selectedEmotion,
    selectedSituation,
    setSelectedEmotion,
    setSelectedSituation,
    resetSelection,
  };

  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
};

export const useEmotion = (): EmotionContextType => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

