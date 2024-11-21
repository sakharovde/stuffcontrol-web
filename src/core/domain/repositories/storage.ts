import Storage from '../models/storage.ts';

export default interface StorageRepository {
  findById(id: string): Promise<Storage | null>;
  save(storage: Storage): Promise<Storage>;
}
