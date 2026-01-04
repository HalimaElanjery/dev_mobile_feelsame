/**
 * Constantes pour les émotions et situations
 */

export interface EmotionType {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export interface SituationType {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const EMOTIONS: EmotionType[] = [
  {
    id: 'joie',
    label: 'Joie',
    emoji: '😊',
    color: '#FFD700',
  },
  {
    id: 'tristesse',
    label: 'Tristesse',
    emoji: '😢',
    color: '#4169E1',
  },
  {
    id: 'colere',
    label: 'Colère',
    emoji: '😠',
    color: '#FF4500',
  },
  {
    id: 'peur',
    label: 'Peur',
    emoji: '😨',
    color: '#800080',
  },
  {
    id: 'surprise',
    label: 'Surprise',
    emoji: '😲',
    color: '#FF69B4',
  },
  {
    id: 'degout',
    label: 'Dégoût',
    emoji: '🤢',
    color: '#228B22',
  },
  {
    id: 'anxiete',
    label: 'Anxiété',
    emoji: '😰',
    color: '#DC143C',
  },
  {
    id: 'espoir',
    label: 'Espoir',
    emoji: '🌟',
    color: '#32CD32',
  },
];

export const SITUATIONS: SituationType[] = [
  {
    id: 'travail',
    label: 'Travail',
    emoji: '💼',
    color: '#4169E1',
  },
  {
    id: 'famille',
    label: 'Famille',
    emoji: '👨‍👩‍👧‍👦',
    color: '#FF69B4',
  },
  {
    id: 'amour',
    label: 'Amour',
    emoji: '💕',
    color: '#FF1493',
  },
  {
    id: 'amitie',
    label: 'Amitié',
    emoji: '👫',
    color: '#32CD32',
  },
  {
    id: 'sante',
    label: 'Santé',
    emoji: '🏥',
    color: '#FF4500',
  },
  {
    id: 'etudes',
    label: 'Études',
    emoji: '📚',
    color: '#4169E1',
  },
  {
    id: 'argent',
    label: 'Argent',
    emoji: '💰',
    color: '#FFD700',
  },
  {
    id: 'loisirs',
    label: 'Loisirs',
    emoji: '🎮',
    color: '#9370DB',
  },
];

// Fonction utilitaire pour obtenir une émotion par ID
export const getEmotionById = (id: string): EmotionType | undefined => {
  return EMOTIONS.find(emotion => emotion.id === id);
};

// Fonction utilitaire pour obtenir une situation par ID
export const getSituationById = (id: string): SituationType | undefined => {
  return SITUATIONS.find(situation => situation.id === id);
};

// Fonction utilitaire pour obtenir l'emoji d'une émotion
export const getEmotionEmoji = (id: string): string => {
  const emotion = getEmotionById(id);
  return emotion?.emoji || '😐';
};

// Fonction utilitaire pour obtenir l'emoji d'une situation
export const getSituationEmoji = (id: string): string => {
  const situation = getSituationById(id);
  return situation?.emoji || '📝';
};