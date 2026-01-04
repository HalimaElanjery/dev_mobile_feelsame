/**
 * Hook personnalisé pour gérer les demandes de match
 * Fournit le nombre de demandes en attente et les fonctions de gestion
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatchRequests } from '../services/matchService';

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  noteId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: string;
  expiresAt: string;
}

export const useMatchRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les demandes de match
      const matchRequests = await getMatchRequests();
      setRequests(matchRequests);
      
      // Compter les demandes en attente
      const pending = matchRequests.filter(req => req.status === 'pending').length;
      setPendingCount(pending);
      
    } catch (err) {
      console.error('Error loading match requests:', err);
      setError('Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Charger les demandes au montage et quand l'utilisateur change
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Fonction pour rafraîchir les demandes
  const refresh = useCallback(() => {
    return loadRequests();
  }, [loadRequests]);

  // Fonction pour marquer une demande comme lue (diminuer le compteur)
  const markAsRead = useCallback((requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'accepted' as const }
          : req
      )
    );
    setPendingCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    requests,
    pendingCount,
    loading,
    error,
    refresh,
    markAsRead,
  };
};