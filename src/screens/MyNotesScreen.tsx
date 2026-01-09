/**
 * Écran de gestion des notes personnelles de l'utilisateur
 * Permet de voir, modifier et supprimer ses propres notes
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { EMOTIONS, SITUATIONS } from '../constants/emotions';
import { useAuth } from '../context/AuthContext';
import { Note, deleteNote, getNotesByUser, updateNote } from '../services/noteService';

interface MyNotesScreenProps {
  navigation: any;
}

export const MyNotesScreen: React.FC<MyNotesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editEmotion, setEditEmotion] = useState('');
  const [editSituation, setEditSituation] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Charger les notes de l'utilisateur
  const loadUserNotes = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userNotes = await getNotesByUser(user.id);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading user notes:', error);
      window.alert('Impossible de charger vos notes');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Rafraîchir les notes
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserNotes();
    setRefreshing(false);
  }, [loadUserNotes]);

  // Charger les notes au montage du composant
  useEffect(() => {
    loadUserNotes();
  }, [loadUserNotes]);

  // Ouvrir le modal d'édition
  const openEditModal = (note: Note) => {
    setSelectedNote(note);
    setEditEmotion(note.emotion);
    setEditSituation(note.situation);
    setEditContent(note.content);
    setEditModalVisible(true);
  };

  // Fermer le modal d'édition
  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedNote(null);
    setEditEmotion('');
    setEditSituation('');
    setEditContent('');
  };

  // Sauvegarder les modifications
  const saveNote = async () => {
    if (!selectedNote || !editContent.trim()) {
      window.alert('Le contenu ne peut pas être vide');
      return;
    }

    try {
      setSaving(true);
      const updatedNote = await updateNote(
        selectedNote.id,
        editEmotion,
        editSituation,
        editContent.trim()
      );

      // Mettre à jour la liste des notes
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === selectedNote.id ? updatedNote : note
        )
      );

      closeEditModal();
      window.alert('Note modifiée avec succès');
    } catch (error) {
      console.error('Error updating note:', error);
      window.alert('Impossible de modifier la note');
    } finally {
      setSaving(false);
    }
  };

  // Supprimer une note
  const confirmDeleteNote = (note: Note) => {
    // Utiliser window.confirm pour la compatibilité web
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.'
    );

    if (confirmed) {
      handleDeleteNote(note);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    try {
      const success = await deleteNote(note.id);
      if (success) {
        setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
        // Utiliser window.alert pour la compatibilité web
        window.alert('Note supprimée avec succès');
      } else {
        window.alert('Impossible de supprimer la note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      window.alert('Impossible de supprimer la note');
    }
  };

  // Obtenir l'emoji pour une émotion
  const getEmotionEmoji = (emotion: string) => {
    const emotionData = EMOTIONS.find(e => e.id === emotion);
    return emotionData?.emoji || '😐';
  };

  // Obtenir l'emoji pour une situation
  const getSituationEmoji = (situation: string) => {
    const situationData = SITUATIONS.find(s => s.id === situation);
    return situationData?.emoji || '📝';
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Rendu d'une note
  const renderNote = ({ item: note }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <View style={styles.emotionSituation}>
          <Text style={styles.emotionText}>
            {getEmotionEmoji(note.emotion)} {note.emotion}
          </Text>
          <Text style={styles.situationText}>
            {getSituationEmoji(note.situation)} {note.situation}
          </Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(note)}
          >
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmDeleteNote(note)}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.noteContent}>{note.content}</Text>

      <View style={styles.noteFooter}>
        <Text style={styles.dateText}>
          {formatDate(note.createdAt)}
        </Text>
        {note.reactionCount && note.reactionCount > 0 && (
          <Text style={styles.reactionCount}>
            ❤️ {note.reactionCount}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de vos notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Notes</Text>
        <View style={styles.placeholder} />
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Aucune note</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez pas encore créé de notes.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateNote')}
          >
            <Text style={styles.createButtonText}>Créer ma première note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal d'édition */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal}>
              <Text style={styles.cancelButton}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier la note</Text>
            <TouchableOpacity onPress={saveNote} disabled={saving}>
              <Text style={[styles.saveButton, saving && styles.disabledButton]}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sélection de l'émotion */}
            <Text style={styles.sectionTitle}>Émotion</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emotionSelector}>
                {EMOTIONS.map((emotion) => (
                  <TouchableOpacity
                    key={emotion.id}
                    style={[
                      styles.emotionOption,
                      editEmotion === emotion.id && styles.selectedOption,
                    ]}
                    onPress={() => setEditEmotion(emotion.id)}
                  >
                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                    <Text style={styles.emotionLabel}>{emotion.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Sélection de la situation */}
            <Text style={styles.sectionTitle}>Situation</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.situationSelector}>
                {SITUATIONS.map((situation) => (
                  <TouchableOpacity
                    key={situation.id}
                    style={[
                      styles.situationOption,
                      editSituation === situation.id && styles.selectedOption,
                    ]}
                    onPress={() => setEditSituation(situation.id)}
                  >
                    <Text style={styles.situationEmoji}>{situation.emoji}</Text>
                    <Text style={styles.situationLabel}>{situation.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Contenu de la note */}
            <Text style={styles.sectionTitle}>Contenu</Text>
            <TextInput
              style={styles.contentInput}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Décrivez ce que vous ressentez..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emotionSituation: {
    flex: 1,
  },
  emotionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  situationText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  reactionCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF3B30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    marginTop: 16,
  },
  emotionSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  emotionOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  situationSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  situationOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
  },
  situationEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  situationLabel: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
});