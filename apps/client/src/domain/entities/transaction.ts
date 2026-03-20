import SyncSession from './sync-session.ts';
import { UUID } from './types/uuid.ts';
import type { StorageEventType } from 'shared';

export default class Transaction {
  constructor(
    public readonly id: UUID,
    public readonly eventType: StorageEventType,
    public readonly data: {
      expiryDate?: Date;
      manufactureDate?: Date;
      productName?: string;
      quantity?: number;
      shelfLifeDays?: number;
      storageName?: string;
    },
    public readonly storageId: UUID,
    public readonly productId?: UUID,
    public readonly batchId?: UUID,
    public readonly createdAt: Date = new Date(),
    public readonly syncSessionId: SyncSession['id'] | null = null
  ) {}
}
