import AddProductsTransaction from '../transactions/add-products-transaction.ts';
import ChangeProductNameTransaction from '../transactions/change-product-name-transaction.ts';
import ChangeStorageNameTransaction from '../transactions/change-storage-name-transaction.ts';
import CreateStorageTransaction from '../transactions/create-storage-transaction.ts';
import DeleteStorageTransaction from '../transactions/delete-storage-transaction.ts';
import RemoveProductsTransaction from '../transactions/remove-products-transaction.ts';

export type NamedTransaction =
  | AddProductsTransaction
  | ChangeProductNameTransaction
  | ChangeStorageNameTransaction
  | CreateStorageTransaction
  | DeleteStorageTransaction
  | RemoveProductsTransaction;
