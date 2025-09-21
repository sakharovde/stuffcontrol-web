import SyncSession from '../sync-session.ts';
import { UUID } from '../types/uuid.ts';

export default class RemoveProductsTransaction {
  constructor(
    public readonly id: UUID,
    public readonly storageId: UUID,
    public readonly productId: UUID,
    public readonly batchId: UUID,
    public readonly quantity: number,
    public readonly createdAt: Date = new Date(),
    public readonly syncSessionId: SyncSession['id'] | null = null
  ) {}
}
