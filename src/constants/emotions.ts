export interface Emotion {
    id: string;
    label: string;
    emoji: string;
}

export interface Situation {
    id: string;
    label: string;
    emoji: string;
}

export const EMOTIONS: Emotion[] = [
    { id: 'joy', label: 'Joie', emoji: '😊' },
    { id: 'sadness', label: 'Tristesse', emoji: '😢' },
    { id: 'anger', label: 'Colère', emoji: '😠' },
    { id: 'fear', label: 'Peur', emoji: '😨' },
    { id: 'anxiety', label: 'Anxiété', emoji: '😰' },
    { id: 'love', label: 'Amour', emoji: '❤️' },
    { id: 'disappointment', label: 'Déception', emoji: '😞' },
    { id: 'hope', label: 'Espoir', emoji: '✨' },
    { id: 'loneliness', label: 'Solitude', emoji: '😔' },
    { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
];

export const SITUATIONS: Situation[] = [
    { id: 'Travail', label: 'Travail', emoji: '💼' },
    { id: 'Études', label: 'Études', emoji: '🎓' },
    { id: 'Relations', label: 'Relations', emoji: '🤝' },
    { id: 'Famille', label: 'Famille', emoji: '👨‍👩‍👧‍👦' },
    { id: 'Santé', label: 'Santé', emoji: '🏥' },
    { id: 'Finances', label: 'Finances', emoji: '💰' },
    { id: 'Projet personnel', label: 'Projet personnel', emoji: '🚀' },
    { id: 'Transition de vie', label: 'Transition de vie', emoji: '🔄' },
    { id: 'Perte', label: 'Perte', emoji: '💔' },
    { id: 'Célébration', label: 'Célébration', emoji: '🎉' },
    { id: 'Décision importante', label: 'Décision importante', emoji: '⚖️' },
    { id: 'Conflit', label: 'Conflit', emoji: '⚔️' },
    { id: 'Autre', label: 'Autre', emoji: '❓' },
];
