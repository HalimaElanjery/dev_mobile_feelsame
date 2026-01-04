/**
 * Écran de sélection d'action après choix d'émotion
 * Permet à l'utilisateur de choisir entre lire les notes ou créer une note
 */

import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useEmotion } from '../context/EmotionContext';
import { useTheme } from '../context/ThemeContext';

interface ActionSelectionScreenProps {
  navigation: any;
}

export const ActionSelectionScreen: React.FC<ActionSelectionScreenProps> = ({
  navigation,
}) => {
  const { selectedEmotion, selectedSituation } = useEmotion();
  const { colors } = useTheme();

  // Obtenir les détails de l'émotion sélectionnée
  const getEmotionDetails = () => {
    const emotions = {
      joy: { label: 'Joie', emoji: '😊' },
      sadness: { label: 'Tristesse', emoji: '😢' },
      anger: { label: 'Colère', emoji: '😠' },
      fear: { label: 'Peur', emoji: '😨' },
      anxiety: { label: 'Anxiété', emoji: '😰' },
      love: { label: 'Amour', emoji: '❤️' },
      disappointment: { label: 'Déception', emoji: '😞' },
      hope: { label: 'Espoir', emoji: '✨' },
      loneliness: { label: 'Solitude', emoji: '😔' },
      gratitude: { label: 'Gratitude', emoji: '🙏' },
    };
    
    return emotions[selectedEmotion as keyof typeof emotions] || { label: selectedEmotion, emoji: '😊' };
  };

  const emotionDetails = getEmotionDetails();

  const handleReadNotes = () => {
    // Naviguer vers l'espace émotionnel pour lire les notes des autres
    navigation.navigate('EmotionSpace');
  };

  const handleCreateNote = () => {
    // Naviguer vers l'écran de création de note
    navigation.navigate('WriteNote');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
    >
      {/* Résumé de la sélection */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Votre sélection
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Émotion:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {emotionDetails.emoji} {emotionDetails.label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Situation:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {selectedSituation}
          </Text>
        </View>
      </View>

      {/* Question principale */}
      <Text style={[styles.mainQuestion, { color: colors.text }]}>
        Que souhaitez-vous faire ?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Choisissez une action pour continuer
      </Text>

      {/* Options d'action */}
      <View style={styles.actionsContainer}>
        {/* Option 1: Lire les notes */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={handleReadNotes}
          activeOpacity={0.7}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📖</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Lire les notes des autres
            </Text>
            <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
              Découvrez comment d'autres personnes vivent des émotions similaires dans des situations comme la vôtre
            </Text>
          </View>
          <View style={styles.actionArrow}>
            <Text style={[styles.arrowText, { color: colors.textSecondary }]}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Créer une note */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={handleCreateNote}
          activeOpacity={0.7}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>✍️</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Créer une note
            </Text>
            <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
              Exprimez vos sentiments et partagez votre expérience avec la communauté
            </Text>
          </View>
          <View style={styles.actionArrow}>
            <Text style={[styles.arrowText, { color: colors.textSecondary }]}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bouton retour */}
      <TouchableOpacity
        style={[styles.backButton, { borderColor: colors.border }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
          ← Modifier ma sélection
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '300',
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});