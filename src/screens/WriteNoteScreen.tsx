/**
 * Écran d'écriture de note émotionnelle
 * Permet à l'utilisateur d'écrire et publier sa note
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEmotion } from '../context/EmotionContext';
import { Input } from '../components/Input';
import { createNote } from '../services/noteService';

interface WriteNoteScreenProps {
  navigation: any;
}

const EMOTION_LABELS: { [key: string]: string } = {
  joy: 'Joie',
  sadness: 'Tristesse',
  anger: 'Colère',
  fear: 'Peur',
  anxiety: 'Anxiété',
  love: 'Amour',
  disappointment: 'Déception',
  hope: 'Espoir',
  loneliness: 'Solitude',
  gratitude: 'Gratitude',
};

export const WriteNoteScreen: React.FC<WriteNoteScreenProps> = ({
  navigation,
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { selectedEmotion, selectedSituation } = useEmotion();

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose avant de publier');
      return;
    }

    if (!user || !selectedEmotion || !selectedSituation) {
      Alert.alert('Erreur', 'Données manquantes');
      return;
    }

    setLoading(true);
    try {
      const note = await createNote(user.id, selectedEmotion, selectedSituation, content);
      console.log('Note créée:', note);
      
      // Rediriger directement vers l'espace émotionnel
      navigation.navigate('EmotionSpace');
    } catch (error) {
      console.error('Error creating note:', error);
      Alert.alert('Erreur', 'Impossible de publier la note');
      setLoading(false);
    }
  };

  if (!selectedEmotion || !selectedSituation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Données manquantes</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Partagez votre ressenti</Text>
          <View style={styles.tags}>
            <Text style={styles.tag}>
              {EMOTION_LABELS[selectedEmotion] || selectedEmotion}
            </Text>
            <Text style={styles.tag}>{selectedSituation}</Text>
          </View>
        </View>

        <Input
          label="Votre note"
          value={content}
          onChangeText={setContent}
          placeholder="Exprimez librement ce que vous ressentez..."
          multiline
          numberOfLines={8}
          autoCapitalize="sentences"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePublish}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Publication...' : 'Publier'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 50,
  },
  backText: {
    fontSize: 16,
    color: '#2196f3',
    textAlign: 'center',
    marginTop: 20,
  },
});

