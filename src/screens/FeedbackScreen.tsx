/**
 * Écran de feedback final
 * Permet à l'utilisateur de donner son ressenti final
 */

import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Input } from '../components/Input';
import { useEmotion } from '../context/EmotionContext';

interface FeedbackScreenProps {
  navigation: any;
}

const FEEDBACK_OPTIONS = [
  { id: 'better', label: 'Je me sens mieux', emoji: '😊' },
  { id: 'same', label: 'Pareil', emoji: '😐' },
  { id: 'worse', label: 'Je me sens moins bien', emoji: '😔' },
  { id: 'grateful', label: 'Reconnaissant(e)', emoji: '🙏' },
  { id: 'hopeful', label: 'Plein(e) d\'espoir', emoji: '✨' },
];

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const { resetSelection } = useEmotion();

  const handleFinish = () => {
    // Réinitialiser la sélection émotionnelle
    resetSelection();
    
    Alert.alert(
      'Merci',
      'Merci d\'avoir partagé votre expérience. Votre anonymat est préservé.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Comment vous sentez-vous maintenant ?</Text>
        <Text style={styles.subtitle}>
          Partagez votre ressenti final (optionnel)
        </Text>
      </View>

      <View style={styles.feedbackGrid}>
        {FEEDBACK_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.feedbackButton,
              selectedFeedback === option.id && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback(option.id)}
          >
            <Text style={styles.feedbackEmoji}>{option.emoji}</Text>
            <Text
              style={[
                styles.feedbackText,
                selectedFeedback === option.id && styles.feedbackTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.commentSection}>
        <Input
          label="Commentaire (optionnel)"
          value={comment}
          onChangeText={setComment}
          placeholder="Souhaitez-vous ajouter quelque chose ?"
          multiline
          numberOfLines={4}
          autoCapitalize="sentences"
        />
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Terminer</Text>
      </TouchableOpacity>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  feedbackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  feedbackButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    minWidth: '45%',
  },
  feedbackButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  feedbackEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  feedbackTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: 24,
  },
  finishButton: {
    backgroundColor: '#2196f3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

