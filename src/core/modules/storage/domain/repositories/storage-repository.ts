import Storage from '../models/storage.ts';

export default interface StorageRepository {
  findById(id: string): Promise<Storage | null>;
  getAll(): Promise<Storage[]>;
  save(storage: Storage): Promise<Storage>;
  remove(id: Storage['id']): Promise<void>;
}
