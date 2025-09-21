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
      productId: domain.productId,
      batchId: domain.batchId,
      data: {
        expiryDate: domain.data.expiryDate ? domain.data.expiryDate.getTime() : undefined,
        manufactureDate: domain.data.manufactureDate ? domain.data.manufactureDate.getTime() : undefined,
        productName: domain.data.productName,
        quantity: domain.data.quantity,
        shelfLifeDays: domain.data.shelfLifeDays,
        storageName: domain.data.storageName,
      },
      createdAt: domain.createdAt.getTime(),
      syncSessionId: domain.syncSessionId,
    };
  };
}
