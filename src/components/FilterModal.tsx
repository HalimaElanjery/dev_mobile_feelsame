/**
 * Composant FilterModal
 * Modal de filtres avancés pour les notes
 */

import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

export interface FilterOptions {
  timeFilter: 'all' | 'today' | 'week' | 'month';
  sortBy: 'recent' | 'popular' | 'oldest';
  emotions: string[];
  situations: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

interface FilterOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.filterOption, selected && styles.filterOptionSelected]}
    onPress={onPress}
  >
    <Text style={[styles.filterOptionText, selected && styles.filterOptionTextSelected]}>
      {label}
    </Text>
    {selected && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
);

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterSectionTitle}>{title}</Text>
    {children}
  </View>
);

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(filters);
    onClose();
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const resetFilters: FilterOptions = {
      timeFilter: 'all',
      sortBy: 'recent',
      emotions: [],
      situations: [],
    };
    setFilters(resetFilters);
  };

  const updateTimeFilter = (timeFilter: FilterOptions['timeFilter']) => {
    setFilters(prev => ({ ...prev, timeFilter }));
  };

  const updateSortBy = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filtres</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Animatable.View animation="fadeInUp" delay={100}>
            <FilterSection title="Période">
              <FilterOption
                label="Toutes"
                selected={filters.timeFilter === 'all'}
                onPress={() => updateTimeFilter('all')}
              />
              <FilterOption
                label="Aujourd'hui"
                selected={filters.timeFilter === 'today'}
                onPress={() => updateTimeFilter('today')}
              />
              <FilterOption
                label="Cette semaine"
                selected={filters.timeFilter === 'week'}
                onPress={() => updateTimeFilter('week')}
              />
              <FilterOption
                label="Ce mois"
                selected={filters.timeFilter === 'month'}
                onPress={() => updateTimeFilter('month')}
              />
            </FilterSection>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={200}>
            <FilterSection title="Trier par">
              <FilterOption
                label="Plus récent"
                selected={filters.sortBy === 'recent'}
                onPress={() => updateSortBy('recent')}
              />
              <FilterOption
                label="Plus populaire"
                selected={filters.sortBy === 'popular'}
                onPress={() => updateSortBy('popular')}
              />
              <FilterOption
                label="Plus ancien"
                selected={filters.sortBy === 'oldest'}
                onPress={() => updateSortBy('oldest')}
              />
            </FilterSection>
          </Animatable.View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  resetButton: {
    fontSize: 16,
    color: '#2196f3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  filterOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#2196f3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});