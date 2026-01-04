/**
 * Écran de sélection d'émotion et de situation
 * Permet à l'utilisateur de choisir son émotion et sa situation
 */

import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { EmotionButton } from '../components/EmotionButton';
import { useEmotion } from '../context/EmotionContext';

interface EmotionSelectionScreenProps {
  navigation: any;
}

const EMOTIONS = [
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

const SITUATIONS = [
  'Travail',
  'Études',
  'Relations',
  'Famille',
  'Santé',
  'Finances',
  'Projet personnel',
  'Transition de vie',
  'Perte',
  'Célébration',
  'Décision importante',
  'Conflit',
  'Autre',
];

export const EmotionSelectionScreen: React.FC<EmotionSelectionScreenProps> = ({
  navigation,
}) => {
  const {
    selectedEmotion,
    selectedSituation,
    setSelectedEmotion,
    setSelectedSituation,
  } = useEmotion();

  const handleContinue = () => {
    if (!selectedEmotion || !selectedSituation) {
      return;
    }
    navigation.navigate('ActionSelection');
  };

  const getEmotionLabel = (emotionId: string) => {
    return EMOTIONS.find((e) => e.id === emotionId)?.label || emotionId;
  };

  const getEmotionEmoji = (emotionId: string) => {
    return EMOTIONS.find((e) => e.id === emotionId)?.emoji || '😊';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Comment vous sentez-vous ?</Text>
      <Text style={styles.subtitle}>Sélectionnez une émotion</Text>

      <View style={styles.emotionsGrid}>
        {EMOTIONS.map((emotion) => (
          <EmotionButton
            key={emotion.id}
            emotion={emotion.label}
            emoji={emotion.emoji}
            onPress={() => setSelectedEmotion(emotion.id)}
            isSelected={selectedEmotion === emotion.id}
          />
        ))}
      </View>

      {selectedEmotion && (
        <>
          <Text style={styles.title}>Dans quelle situation ?</Text>
          <Text style={styles.subtitle}>Sélectionnez une situation</Text>

          <View style={styles.situationsGrid}>
            {SITUATIONS.map((situation) => (
              <TouchableOpacity
                key={situation}
                style={[
                  styles.situationButton,
                  selectedSituation === situation && styles.situationButtonSelected,
                ]}
                onPress={() => setSelectedSituation(situation)}
              >
                <Text
                  style={[
                    styles.situationText,
                    selectedSituation === situation && styles.situationTextSelected,
                  ]}
                >
                  {situation}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedEmotion && selectedSituation && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  situationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  situationButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  situationButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  situationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  situationTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#2196f3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

