/**
 * Service de stockage local utilisant AsyncStorage
 * Gère la persistance des données utilisateur, notes, discussions et messages
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const STORAGE_KEYS = {
  USERS: '@feelsame:users',
  NOTES: '@feelsame:notes',
  DISCUSSIONS: '@feelsame:discussions',
  MESSAGES: '@feelsame:messages',
  CURRENT_USER: '@feelsame:currentUser',
};

/**
 * Récupère une valeur depuis AsyncStorage
 */
export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error getting item from storage:', error);
    return null;
  }
};

/**
 * Sauvegarde une valeur dans AsyncStorage
 */
export const setItem = async (key: string, value: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error setting item in storage:', error);
    return false;
  }
};

/**
 * Supprime une valeur d'AsyncStorage
 */
export const removeItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing item from storage:', error);
    return false;
  }
};

/**
 * Récupère tous les utilisateurs
 */
export const getUsers = async (): Promise<any[]> => {
  const data = await getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

/**
 * Sauvegarde tous les utilisateurs
 */
export const saveUsers = async (users: any[]): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

/**
 * Récupère toutes les notes
 */
export const getNotes = async (): Promise<any[]> => {
  const data = await getItem(STORAGE_KEYS.NOTES);
  return data ? JSON.parse(data) : [];
};

/**
 * Sauvegarde toutes les notes
 */
export const saveNotes = async (notes: any[]): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

/**
 * Récupère toutes les discussions
 */
export const getDiscussions = async (): Promise<any[]> => {
  const data = await getItem(STORAGE_KEYS.DISCUSSIONS);
  return data ? JSON.parse(data) : [];
};

/**
 * Sauvegarde toutes les discussions
 */
export const saveDiscussions = async (discussions: any[]): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
};

/**
 * Récupère tous les messages
 */
export const getMessages = async (): Promise<any[]> => {
  const data = await getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
};

/**
 * Sauvegarde tous les messages
 */
export const saveMessages = async (messages: any[]): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = async (): Promise<any | null> => {
  const data = await getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

/**
 * Sauvegarde l'utilisateur actuellement connecté
 */
export const saveCurrentUser = async (user: any): Promise<boolean> => {
  return await setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

/**
 * Supprime l'utilisateur actuellement connecté (déconnexion)
 */
export const clearCurrentUser = async (): Promise<boolean> => {
  return await removeItem(STORAGE_KEYS.CURRENT_USER);
};

