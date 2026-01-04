/**
 * Composant DiscussButton
 * Bouton pour demander une discussion privée avec l'auteur d'une note
 */

import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { sendMatchRequest } from '../services/matchService';

interface DiscussButtonProps {
  noteId: string;
  noteAuthorId: string;
  onRequestSent?: () => void;
}

export const DiscussButton: React.FC<DiscussButtonProps> = ({
  noteId,
  noteAuthorId,
  onRequestSent,
}) => {
  const [loading, setLoading] = useState(false);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { colors } = useTheme();

  const handleDiscussRequest = async () => {
    console.log('DiscussButton pressed');

    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Vous devez être connecté pour demander une discussion');
      } else {
        Alert.alert('Erreur', 'Vous devez être connecté pour demander une discussion');
      }
      return;
    }

    if (user.id === noteAuthorId) {
      if (Platform.OS === 'web') {
        window.alert('Vous ne pouvez pas discuter avec vous-même');
      } else {
        Alert.alert('Information', 'Vous ne pouvez pas discuter avec vous-même');
      }
      return;
    }

    // Ouvrir la modale de confirmation
    console.log('Opening confirmation modal');
    setConfirmModalVisible(true);
  };

  const cancelRequest = () => {
    setInputModalVisible(false);
    setConfirmModalVisible(false);
    setMessage('');
  };

  const proceedToInput = () => {
    setConfirmModalVisible(false);
    setInputModalVisible(true);
  };

  const confirmSendRequest = async () => {
    setInputModalVisible(false);
    await sendRequest(message || undefined);
    setMessage('');
  };

  const sendRequest = async (msg?: string) => {
    if (!user) return;

    setLoading(true);
    // Haptics might fail on web, so wrap it
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Ignore haptics error on web
    }

    try {
      console.log('Calling API sendMatchRequest...');
      const result = await sendMatchRequest(user.id, noteId, noteAuthorId, msg);
      console.log('API Result:', result);

      showNotification({
        type: 'success',
        title: 'Demande envoyée',
        message: 'Votre demande de discussion a été envoyée. L\'autre personne a 24h pour répondre.',
        duration: 4000,
      });

      onRequestSent?.();
    } catch (error: any) {
      console.error('API Error:', error);
      // Gestion spécifique de l'erreur "demande déjà en cours"
      if (error.message && error.message.includes('Une demande est déjà en cours')) {
        showNotification({
          type: 'info',
          title: 'Demande déjà envoyée',
          message: 'Vous avez déjà envoyé une demande de discussion pour cette note. Patientez la réponse.',
          duration: 4000,
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: error.message || 'Impossible d\'envoyer la demande',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Animatable.View animation="fadeIn" delay={300}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={handleDiscussRequest}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.text}>
            {loading ? 'Envoi...' : 'Discuter'}
          </Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Modale de Confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={cancelRequest}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Discussion privée</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Voulez-vous envoyer une demande de discussion privée à cette personne ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={cancelRequest}
              >
                <Text style={styles.textStyle}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={proceedToInput}
              >
                <Text style={styles.textStyle}>Oui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modale de Message (Input) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inputModalVisible}
        onRequestClose={cancelRequest}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Message personnel</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Optionnel : Ajoutez un petit message pour vous présenter
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              onChangeText={setMessage}
              value={message}
              placeholder="Ex: Salut, ton histoire me touche..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={150}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={cancelRequest}
              >
                <Text style={styles.textStyle}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonSend, { backgroundColor: colors.primary }]}
                onPress={confirmSendRequest}
              >
                <Text style={styles.textStyle}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    height: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#ff5252',
  },
  buttonSend: {
    // backgroundColor set via prop
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
