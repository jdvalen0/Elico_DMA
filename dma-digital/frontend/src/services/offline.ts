import Dexie, { Table } from 'dexie';

export interface OfflineResponse {
  id?: number;
  evaluationId: string;
  subcriterionId: string;
  dimensionId?: string;
  value: number;
  notes?: string;
  synced: boolean;
  timestamp: number;
}

export interface OfflineEvidence {
  id?: number;
  evaluationId: string;
  type: string;
  file: Blob;
  fileName: string;
  mimeType: string;
  description?: string;
  synced: boolean;
  timestamp: number;
}

class DMAOfflineDB extends Dexie {
  responses!: Table<OfflineResponse>;
  evidence!: Table<OfflineEvidence>;
  syncQueue!: Table<{ id?: number; type: string; payload: any; timestamp: number }>;

  constructor() {
    super('DMAOfflineDB');
    this.version(1).stores({
      responses: '++id, evaluationId, subcriterionId, synced, timestamp',
      evidence: '++id, evaluationId, synced, timestamp',
      syncQueue: '++id, type, timestamp',
    });
  }
}

export const db = new DMAOfflineDB();

export const offlineService = {
  async saveResponse(response: Omit<OfflineResponse, 'id' | 'synced' | 'timestamp'>) {
    await db.responses.add({
      ...response,
      synced: false,
      timestamp: Date.now(),
    });
  },

  async getPendingResponses(evaluationId: string) {
    return await db.responses
      .where('evaluationId')
      .equals(evaluationId)
      .and((r) => !r.synced)
      .toArray();
  },

  async markResponseSynced(id: number) {
    await db.responses.update(id, { synced: true });
  },

  async saveEvidence(evidence: Omit<OfflineEvidence, 'id' | 'synced' | 'timestamp'>) {
    await db.evidence.add({
      ...evidence,
      synced: false,
      timestamp: Date.now(),
    });
  },

  async getPendingEvidence(evaluationId: string) {
    return await db.evidence
      .where('evaluationId')
      .equals(evaluationId)
      .and((e) => !e.synced)
      .toArray();
  },

  async markEvidenceSynced(id: number) {
    await db.evidence.update(id, { synced: true });
  },
};
