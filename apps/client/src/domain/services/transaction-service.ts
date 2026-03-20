import Transaction from '../entities/transaction.ts';
import DeleteStorageTransaction from '../entities/transactions/delete-storage-transaction.ts';
import AddProductsTransaction from '../entities/transactions/add-products-transaction.ts';
import RemoveProductsTransaction from '../entities/transactions/remove-products-transaction.ts';
import ChangeProductNameTransaction from '../entities/transactions/change-product-name-transaction.ts';
import CreateStorageTransaction from '../entities/transactions/create-storage-transaction.ts';
import ChangeStorageNameTransaction from '../entities/transactions/change-storage-name-transaction.ts';
import { NamedTransaction } from '../entities/types/named-transaction.ts';

export default class TransactionService {
  toNamed = (transaction: Transaction): NamedTransaction => {
    switch (transaction.eventType) {
      case 'addProducts':
        if (
          !transaction.productId ||
          !transaction.batchId ||
          !transaction.data.productName ||
          transaction.data.quantity === undefined
        ) {
          throw new Error('Missing required fields');
        }

        return new AddProductsTransaction(
          transaction.id,
          transaction.storageId,
          transaction.productId,
          transaction.batchId,
          transaction.data.productName,
          transaction.data.quantity,
          transaction.data.expiryDate,
          transaction.data.manufactureDate,
          transaction.data.shelfLifeDays,
          transaction.createdAt,
          transaction.syncSessionId
        );

      case 'removeProducts':
        if (!transaction.productId || !transaction.batchId || transaction.data.quantity === undefined) {
          throw new Error('Missing required fields');
        }

        return new RemoveProductsTransaction(
          transaction.id,
          transaction.storageId,
          transaction.productId,
          transaction.batchId,
          transaction.data.quantity,
          transaction.createdAt,
          transaction.syncSessionId
        );

      case 'changeProductName':
        if (!transaction.productId || !transaction.data.productName) {
          throw new Error('Missing required fields');
        }

        return new ChangeProductNameTransaction(
          transaction.id,
          transaction.storageId,
          transaction.productId,
          transaction.data.productName,
          transaction.createdAt,
          transaction.syncSessionId
        );

      case 'createStorage':
        if (!transaction.data.storageName) {
          throw new Error('Missing required fields');
        }

        return new CreateStorageTransaction(
          transaction.id,
          transaction.storageId,
          transaction.data.storageName,
          transaction.createdAt,
          transaction.syncSessionId
        );

      case 'changeStorageName':
        if (!transaction.data.storageName) {
          throw new Error('Missing required fields');
        }

        return new ChangeStorageNameTransaction(
          transaction.id,
          transaction.storageId,
          transaction.data.storageName,
          transaction.createdAt,
          transaction.syncSessionId
        );

      case 'deleteStorage':
        return new DeleteStorageTransaction(
          transaction.id,
          transaction.storageId,
          transaction.createdAt,
          transaction.syncSessionId
        );
    }

    throw new Error('Transaction.eventType is not exists');
  };

  fromNamed = (namedTransaction: NamedTransaction): Transaction => {
    if (namedTransaction instanceof AddProductsTransaction) {
      return new Transaction(
        namedTransaction.id,
        'addProducts',
        {
          expiryDate: namedTransaction.expiryDate,
          manufactureDate: namedTransaction.manufactureDate,
          productName: namedTransaction.productName,
          quantity: namedTransaction.quantity,
          shelfLifeDays: namedTransaction.shelfLifeDays,
        },
        namedTransaction.storageId,
        namedTransaction.productId,
        namedTransaction.batchId,
        namedTransaction.createdAt,
        namedTransaction.syncSessionId
      );
    } else if (namedTransaction instanceof RemoveProductsTransaction) {
      return new Transaction(
        namedTransaction.id,
        'removeProducts',
        { quantity: namedTransaction.quantity },
        namedTransaction.storageId,
        namedTransaction.productId,
        namedTransaction.batchId,
        namedTransaction.createdAt,
        namedTransaction.syncSessionId
      );
    } else if (namedTransaction instanceof ChangeProductNameTransaction) {
      return new Transaction(
        namedTransaction.id,
        'changeProductName',
        { productName: namedTransaction.productName },
        namedTransaction.storageId,
        namedTransaction.productId,
        undefined,
        namedTransaction.createdAt,
        namedTransaction.syncSessionId
      );
    } else if (namedTransaction instanceof CreateStorageTransaction) {
      return new Transaction(
        namedTransaction.id,
        'createStorage',
        { storageName: namedTransaction.storageName },
        namedTransaction.storageId,
        undefined,
        undefined,
        namedTransaction.createdAt,
        namedTransaction.syncSessionId
      );
    } else if (namedTransaction instanceof ChangeStorageNameTransaction) {
      return new Transaction(
        namedTransaction.id,
        'changeStorageName',
        { storageName: namedTransaction.storageName },
        namedTransaction.storageId,
        undefined,
        undefined,
        namedTransaction.createdAt,
        namedTransaction.syncSessionId
      );
    } else if (namedTransaction instanceof DeleteStorageTransaction) {
      return new Transaction(
        namedTransaction.id,
        'deleteStorage',
        {},
        namedTransaction.storageId,
        undefined,
        undefined,
        namedTransaction.createdAt,
        namedTransaction.syncSessionId
      );
    }

    throw new Error('NamedTransaction is not exists');
  };
}
