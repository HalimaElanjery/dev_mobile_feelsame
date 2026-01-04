/**
 * Écran de profil anonyme
 * Statistiques personnelles et préférences
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoadingSpinner } from '../components';
import { AnimatedCard } from '../components/AnimatedCard';
import { EmotionChart } from '../components/EmotionChart';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNotesByUser } from '../services/noteService';
import { getMessages } from '../services/storage';

interface UserStats {
  notesCount: number;
  discussionsCount: number;
  activeDays: number;
  emotionFrequency: { [key: string]: number };
  favoriteEmotion: string;
  favoriteSituation: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );
};

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Charger les notes de l'utilisateur
      const userNotes = await getNotesByUser(user.id);
      
      // Charger les messages de l'utilisateur
      const allMessages = await getMessages();
      const userMessages = allMessages.filter((msg: any) => msg.userId === user.id);
      
      // Calculer les statistiques
      const emotionFrequency: { [key: string]: number } = {};
      const situationFrequency: { [key: string]: number } = {};
      
      userNotes.forEach(note => {
        emotionFrequency[note.emotion] = (emotionFrequency[note.emotion] || 0) + 1;
        situationFrequency[note.situation] = (situationFrequency[note.situation] || 0) + 1;
      });

      // Trouver l'émotion et la situation favorites
      const favoriteEmotion = Object.keys(emotionFrequency).reduce((a, b) => 
        emotionFrequency[a] > emotionFrequency[b] ? a : b, 'joy'
      );
      
      const favoriteSituation = Object.keys(situationFrequency).reduce((a, b) => 
        situationFrequency[a] > situationFrequency[b] ? a : b, 'Travail'
      );

      // Calculer les jours actifs (approximation)
      const uniqueDays = new Set(
        userNotes.map(note => new Date(note.createdAt).toDateString())
      );

      // Calculer le nombre de discussions uniques
      const uniqueDiscussions = new Set(
        userMessages.map((msg: any) => msg.discussionId)
      );

      const userStats: UserStats = {
        notesCount: userNotes.length,
        discussionsCount: uniqueDiscussions.size,
        activeDays: uniqueDays.size,
        emotionFrequency,
        favoriteEmotion,
        favoriteSituation,
      };

      setStats(userStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionChartData = () => {
    if (!stats) return [];

    const emotionColors: { [key: string]: string } = {
      joy: '#4CAF50',
      sadness: '#2196F3',
      anger: '#F44336',
      fear: '#9C27B0',
      anxiety: '#FF9800',
      love: '#E91E63',
      disappointment: '#607D8B',
      hope: '#00BCD4',
      loneliness: '#795548',
      gratitude: '#8BC34A',
    };

    const emotionEmojis: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      anxiety: '😰',
      love: '❤️',
      disappointment: '😞',
      hope: '✨',
      loneliness: '😔',
      gratitude: '🙏',
    };

    return Object.entries(stats.emotionFrequency)
      .map(([emotion, count]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: count,
        color: emotionColors[emotion] || '#666',
        emoji: emotionEmojis[emotion] || '😊',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 émotions
  };

  const handleLogout = async () => {
    console.log('🔴 Profile logout button clicked');
    
    // Utiliser window.confirm au lieu d'Alert pour le web
    const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    
    if (confirmed) {
      console.log('🔴 Profile logout confirmed');
      try {
        await logout();
        console.log('✅ Profile logout completed successfully');
        // La navigation sera gérée automatiquement par AuthContext
      } catch (error) {
        console.error('❌ Profile logout error:', error);
      }
    } else {
      console.log('🔴 Profile logout cancelled');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner text="Chargement de votre profil..." />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Mon Profil</Text>
        <ThemeToggle />
      </View>

      <AnimatedCard animation="fadeInUp" delay={100}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vos statistiques</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Notes partagées" 
            value={stats?.notesCount || 0} 
            icon="📝" 
          />
          <StatCard 
            title="Discussions" 
            value={stats?.discussionsCount || 0} 
            icon="💬" 
          />
          <StatCard 
            title="Jours actifs" 
            value={stats?.activeDays || 0} 
            icon="📅" 
          />
        </View>
      </AnimatedCard>

      {stats && Object.keys(stats.emotionFrequency).length > 0 && (
        <AnimatedCard animation="fadeInUp" delay={200}>
          <EmotionChart 
            data={getEmotionChartData()}
            title="Vos émotions les plus fréquentes"
          />
        </AnimatedCard>
      )}

      <AnimatedCard animation="fadeInUp" delay={300}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vos préférences</Text>
        <View style={styles.preferenceItem}>
          <Text style={[styles.preferenceLabel, { color: colors.textSecondary }]}>
            Émotion la plus exprimée
          </Text>
          <Text style={[styles.preferenceValue, { color: colors.text }]}>
            {stats?.favoriteEmotion || 'Aucune'}
          </Text>
        </View>
        <View style={styles.preferenceItem}>
          <Text style={[styles.preferenceLabel, { color: colors.textSecondary }]}>
            Situation la plus fréquente
          </Text>
          <Text style={[styles.preferenceValue, { color: colors.text }]}>
            {stats?.favoriteSituation || 'Aucune'}
          </Text>
        </View>
      </AnimatedCard>

      <AnimatedCard animation="fadeInUp" delay={400}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes contenus</Text>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => navigation.navigate('MyNotes')}
        >
          <Text style={[styles.settingText, { color: colors.text }]}>📝 Gérer mes notes</Text>
        </TouchableOpacity>
      </AnimatedCard>

      <AnimatedCard animation="fadeInUp" delay={500}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </AnimatedCard>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Toutes vos données restent anonymes et privées
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: 14,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});