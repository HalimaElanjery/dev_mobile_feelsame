/**
 * Écran de l'espace émotionnel
 * Affiche les notes d'autres utilisateurs dans la même situation
 */

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LoadingSpinner } from '../components';
import { FilterModal, FilterOptions } from '../components/FilterModal';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useEmotion } from '../context/EmotionContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { getActiveDiscussion } from '../services/discussionService';
import type { Note } from '../services/noteService';
import { getNotesByEmotionAndSituation } from '../services/noteService';

interface EmotionSpaceScreenProps {
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

export const EmotionSpaceScreen: React.FC<EmotionSpaceScreenProps> = ({
  navigation,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    timeFilter: 'all',
    sortBy: 'recent',
    emotions: [],
    situations: [],
  });

  const { user } = useAuth();
  const { selectedEmotion, selectedSituation } = useEmotion();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadNotes();
  }, [selectedEmotion, selectedSituation]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [notes, filters, searchQuery]);

  // Recharger les notes quand l'écran est affiché (après création d'une note)
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [selectedEmotion, selectedSituation])
  );

  const loadNotes = async () => {
    if (!selectedEmotion || !selectedSituation) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading notes for:', selectedEmotion, selectedSituation);
      const fetchedNotes = await getNotesByEmotionAndSituation(
        selectedEmotion,
        selectedSituation
      );
      console.log('Fetched notes:', fetchedNotes.length);
      
      setNotes(fetchedNotes);
      console.log('Notes set:', fetchedNotes.length);
    } catch (error) {
      console.error('Error loading notes:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les notes',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...notes];

    // Appliquer le filtre de recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Appliquer le filtre de temps
    const now = new Date();
    switch (filters.timeFilter) {
      case 'today':
        filtered = filtered.filter(note => {
          const noteDate = new Date(note.createdAt);
          return noteDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(note => new Date(note.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(note => new Date(note.createdAt) >= monthAgo);
        break;
    }

    // Appliquer le tri
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        // Simuler la popularité (en production, utiliser de vraies métriques)
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    setFilteredNotes(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const handleJoinDiscussion = async () => {
    if (!selectedEmotion || !selectedSituation) {
      return;
    }

    try {
      const discussion = await getActiveDiscussion(selectedEmotion, selectedSituation);
      if (discussion) {
        navigation.navigate('Chat', { discussionId: discussion.id });
        showNotification({
          type: 'success',
          title: 'Discussion rejointe',
          message: 'Vous avez rejoint la discussion anonyme',
        });
      } else {
        Alert.alert('Erreur', 'Impossible de rejoindre la discussion');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleReaction = (noteId: string, emoji: string) => {
    showNotification({
      type: 'info',
      title: 'Réaction ajoutée',
      message: `Vous avez réagi avec ${emoji}`,
      duration: 2000,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    showNotification({
      type: 'info',
      title: 'Filtres appliqués',
      message: 'Les notes ont été filtrées selon vos critères',
      duration: 2000,
    });
  };

  if (!selectedEmotion || !selectedSituation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Données manquantes</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Espace émotionnel</Text>
        <View style={styles.tags}>
          <Text style={[styles.tag, { backgroundColor: colors.primaryLight, color: colors.primary }]}>
            {EMOTION_LABELS[selectedEmotion] || selectedEmotion}
          </Text>
          <Text style={styles.tag}>{selectedSituation}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {`${filteredNotes.length} note${filteredNotes.length > 1 ? 's' : ''} ${searchQuery || filters.timeFilter !== 'all' ? 'filtrée' : 'partagée'}${filteredNotes.length > 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Rechercher dans les notes..."
          onSearch={handleSearch}
          suggestions={['travail stressant', 'famille difficile', 'relation compliquée']}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <LoadingSpinner text="Chargement des notes..." />
        ) : filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery || filters.timeFilter !== 'all' 
                ? 'Aucune note ne correspond à vos critères.'
                : 'Aucune note partagée pour cette combinaison.'
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {!searchQuery && filters.timeFilter === 'all' 
                ? 'Vous êtes le premier à partager dans cet espace !'
                : 'Essayez de modifier vos filtres de recherche.'
              }
            </Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              content={note.content}
              emotion={EMOTION_LABELS[note.emotion] || note.emotion}
              situation={note.situation}
              createdAt={note.createdAt}
              authorId={note.userId}
              onReaction={handleReaction}
            />
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.discussionButton, { backgroundColor: colors.primary }]}
          onPress={handleJoinDiscussion}
        >
          <Text style={styles.discussionButtonText}>
            💬 Rejoindre une discussion
          </Text>
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f3e5f5',
    color: '#9c27b0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  discussionButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  discussionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

