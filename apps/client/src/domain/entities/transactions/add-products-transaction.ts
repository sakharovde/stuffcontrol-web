import SyncSession from '../sync-session.ts';
import { UUID } from '../types/uuid.ts';

export default class AddProductsTransaction {
  constructor(
    public readonly id: UUID,
    public readonly storageId: UUID,
    public readonly productId: UUID,
    public readonly batchId: UUID,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly expiryDate?: Date,
    public readonly manufactureDate?: Date,
    public readonly shelfLifeDays?: number,
    public readonly createdAt: Date = new Date(),
    public readonly syncSessionId: SyncSession['id'] | null = null
  ) {}
}
