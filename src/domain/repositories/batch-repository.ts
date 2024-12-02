import Batch from '../models/batch.ts';

export default interface BatchRepository {
  findAll: () => Promise<Batch[]>;
  findAllByProductId: (productId: string) => Promise<Batch[]>;
  findById: (id: Batch['id']) => Promise<Batch | null>;
  save: (batch: Batch) => Promise<void>;
  delete: (id: Batch['id']) => Promise<void>;
}
