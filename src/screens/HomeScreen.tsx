/**
 * Écran d'accueil
 * Présente le concept et permet de commencer ou de se déconnecter
 */

import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { AnimatedCard } from '../components/AnimatedCard';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { createShadowStyle } from '../utils/platformStyles';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { logout, user } = useAuth();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    console.log('🔴 Logout button clicked');
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            console.log('🔴 Logout confirmed, calling logout function...');
            try {
              await logout();
              console.log('✅ Logout completed successfully');
              showNotification({
                type: 'info',
                title: 'Déconnexion',
                message: 'Vous avez été déconnecté avec succès',
              });
            } catch (error) {
              console.error('❌ Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleStart = () => {
    navigation.navigate('EmotionSelection');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleMatchRequests = () => {
    navigation.navigate('MatchRequests');
  };

  const handlePrivateDiscussions = () => {
    navigation.navigate('PrivateDiscussions');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleMatchRequests}>
            <Text style={styles.headerButtonIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handlePrivateDiscussions}>
            <Text style={styles.headerButtonIcon}>🔒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animatable.View animation="fadeInDown" duration={800} style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>FeelSame</Text>
        <Animatable.Text 
          animation="fadeIn" 
          delay={300} 
          duration={800}
          style={[styles.tagline, { color: colors.textSecondary }]}
        >
          Partagez vos émotions, anonymement
        </Animatable.Text>
      </Animatable.View>

      <AnimatedCard 
        animation="fadeInUp" 
        delay={500} 
        style={[styles.conceptBox, { backgroundColor: colors.surface }] as any}
      >
        <Text style={[styles.conceptTitle, { color: colors.text }]}>
          Comment ça marche ?
        </Text>
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          FeelSame vous permet d'exprimer vos émotions et de découvrir que vous
          n'êtes pas seul(e) à vivre certaines situations.
        </Text>
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          Choisissez une émotion et une situation, partagez votre ressenti, et
          rejoignez une discussion temporaire avec d'autres personnes vivant la
          même expérience.
        </Text>
        <Text style={[styles.conceptText, { color: colors.textSecondary }]}>
          Tout est anonyme. Aucun contact ne sera partagé. Les discussions
          expirent après 30 minutes.
        </Text>
      </AnimatedCard>

      <Animatable.View animation="fadeInUp" delay={700} style={styles.buttonContainer}>
        <GradientButton
          title="Commencer"
          onPress={handleStart}
          colors={[colors.primary, '#1976d2']}
          style={styles.startButtonWrapper}
        />
      </Animatable.View>

      <Animatable.View animation="fadeIn" delay={900}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: 18,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  conceptBox: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    ...createShadowStyle(),
  },
  conceptTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  conceptText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  startButtonWrapper: {
    width: '100%',
  },
  logoutButton: {
    padding: 12,
  },
  logoutButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
});

