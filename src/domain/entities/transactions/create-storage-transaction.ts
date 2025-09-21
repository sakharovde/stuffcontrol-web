import SyncSession from '../sync-session.ts';
import { UUID } from '../types/uuid.ts';

export default class CreateStorageTransaction {
  constructor(
    public readonly id: UUID,
    public readonly storageId: UUID,
    public readonly storageName: string,
    public readonly createdAt: Date = new Date(),
    public readonly syncSessionId: SyncSession['id'] | null = null
  ) {}
}
