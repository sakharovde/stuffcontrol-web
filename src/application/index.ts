export { default } from './application.ts';

export type { default as StorageDto } from './_deprecated/dto/storage-dto.ts';
export type { default as ProductDto } from './_deprecated/dto/product-dto.ts';
export type { default as StorageWithProductsDto } from './_deprecated/dto/storage-with-products-dto.ts';
export type { default as BatchDto } from './_deprecated/dto/batch-dto.ts';

export type { default as GetStoragesWithProductsQuery } from './_deprecated/queries/batch/get-by-storage.ts';
export type { default as GetStorageByIdQuery } from './_deprecated/queries/storage/get-by-id.ts';

export type { CreateStorageCommand } from './_deprecated/commands/storage/create-storage.ts';
export type { AddNewProductToStorageCommand } from './_deprecated/commands/product/add-new-products-to-storage.ts';
export type { ChangeBatchQuantityCommand } from './_deprecated/commands/batch/change-batch-quantity-command.ts';
export type { RemoveStorageCommand } from './_deprecated/commands/storage/remove-storage.ts';
export type { RemoveProductCommand } from './_deprecated/commands/product/remove-product.ts';
export type { UpdateStorageCommand } from './_deprecated/commands/storage/update-storage.ts';
export type { RegisterUserCommand } from './_deprecated/commands/user/register-user.ts';
