import Batch from '../models/batch.ts';

export default interface BatchRepository {
  findAll: () => Promise<Batch[]>;
  findAllByStorageId: (storageId: Batch['storageId']) => Promise<Batch[]>;
  findById: (id: Batch['id']) => Promise<Batch | null>;
  save: (batch: Batch) => Promise<void>;
  delete: (id: Batch['id']) => Promise<void>;
}
