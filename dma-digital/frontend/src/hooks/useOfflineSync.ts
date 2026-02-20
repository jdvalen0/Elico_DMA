import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { offlineService } from '../services/offline';

export const useOfflineSync = (evaluationId: string) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && evaluationId) {
      syncData(evaluationId);
    }
  }, [isOnline, evaluationId]);

  const syncData = async (evalId: string) => {
    if (syncing) return;

    setSyncing(true);
    try {
      // Sincronizar respuestas
      const pendingResponses = await offlineService.getPendingResponses(evalId);
      for (const response of pendingResponses) {
        try {
          await api.put(`/responses/evaluations/${evalId}/responses`, {
            subcriterionId: response.subcriterionId,
            dimensionId: response.dimensionId,
            value: response.value,
            notes: response.notes,
          });
          if (response.id) {
            await offlineService.markResponseSynced(response.id);
          }
        } catch (error) {
          console.error('Error syncing response:', error);
        }
      }

      // Sincronizar evidencias
      const pendingEvidence = await offlineService.getPendingEvidence(evalId);
      for (const evidence of pendingEvidence) {
        try {
          const formData = new FormData();
          formData.append('file', evidence.file, evidence.fileName);
          formData.append('type', evidence.type);
          formData.append('description', evidence.description || '');

          await api.post(`/evidence/evaluations/${evalId}/evidence`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (evidence.id) {
            await offlineService.markEvidenceSynced(evidence.id);
          }
        } catch (error) {
          console.error('Error syncing evidence:', error);
        }
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    isOnline,
    syncing,
    lastSync,
    syncNow: () => syncData(evaluationId),
  };
};
