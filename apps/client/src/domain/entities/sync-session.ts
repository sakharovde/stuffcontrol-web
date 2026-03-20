import { UUID } from './types/uuid.ts';

export default class SyncSession {
  constructor(
    public readonly id: UUID,
    public readonly storageId: UUID,
    public readonly snapshot: Array<{
      storageId: UUID;
      productId: UUID;
      batchId: UUID;
      productName: string;
      quantity: number;
      expiryDate?: string;
      manufactureDate?: string;
      shelfLifeDays?: number;
    }>,
    public readonly createdAt: Date = new Date()
  ) {}
}
