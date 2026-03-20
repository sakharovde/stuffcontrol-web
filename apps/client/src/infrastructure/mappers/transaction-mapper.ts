import Transaction from '../../domain/entities/transaction.ts';
import { IdbTransaction } from '../clients/idb-client/idb-types.ts';

export default class TransactionMapper {
  public static toDomain = (persistence: IdbTransaction): Transaction => {
    return new Transaction(
      persistence.id,
      persistence.eventType,
      {
        expiryDate: persistence.data.expiryDate ? new Date(persistence.data.expiryDate) : undefined,
        manufactureDate: persistence.data.manufactureDate ? new Date(persistence.data.manufactureDate) : undefined,
        productName: persistence.data.productName,
        quantity: persistence.data.quantity,
        shelfLifeDays: persistence.data.shelfLifeDays,
        storageName: persistence.data.storageName,
      },
      persistence.storageId,
      persistence.productId,
      persistence.batchId,
      new Date(persistence.createdAt),
      persistence.syncSessionId || null
    );
  };

  public static toPersistence = (domain: Transaction): IdbTransaction => {
    return {
      id: domain.id,
      storageId: domain.storageId,
      eventType: domain.eventType,
      ...(domain.productId ? { productId: domain.productId } : {}),
      ...(domain.batchId ? { batchId: domain.batchId } : {}),
      data: {
        ...(domain.data.expiryDate ? { expiryDate: domain.data.expiryDate.getTime() } : {}),
        ...(domain.data.manufactureDate ? { manufactureDate: domain.data.manufactureDate.getTime() } : {}),
        ...(domain.data.productName ? { productName: domain.data.productName } : {}),
        ...(domain.data.quantity ? { quantity: domain.data.quantity } : {}),
        ...(domain.data.shelfLifeDays ? { shelfLifeDays: domain.data.shelfLifeDays } : {}),
        ...(domain.data.storageName ? { storageName: domain.data.storageName } : {}),
      },
      createdAt: domain.createdAt.getTime(),
      syncSessionId: domain.syncSessionId,
    };
  };
}
