import { v4 as uuidv4 } from 'uuid';
import {
  BatchRepository,
  ProductItem,
  ProductItemRepository,
  ProductRepository,
  Storage,
  StorageNameEmptySpecification,
  StorageRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../domain';
import StorageWithProductsDto, { StorageWithProductsDtoFactory } from '../dto/storage-with-products-dto.ts';
import ProductDto, { ProductDtoFactory } from '../dto/product-dto.ts';
import StorageDto, { StorageDtoFactory } from '../dto/storage-dto.ts';

export default class StorageService {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly productRepository: ProductRepository,
    private readonly nameEmptySpecification: StorageNameEmptySpecification,
    private readonly storageTransactionRepository: StorageTransactionRepository,
    private readonly productItemRepository: ProductItemRepository,
    private readonly batchRepository: BatchRepository
  ) {}

  async create(name: StorageDto['name']): Promise<StorageDto> {
    const isNameEmpty = await this.nameEmptySpecification.isSatisfiedBy(name);
    if (isNameEmpty) {
      throw new Error('Storage name cannot be empty');
    }

    const storage = await this.storageRepository.save(new Storage(uuidv4(), name));

    return StorageDtoFactory.create(storage);
  }

  getAll(): Promise<StorageDto[]> {
    return this.storageRepository.getAll();
  }

  getAllProducts = async (storageId: StorageDto['id']): Promise<ProductDto[]> => {
    const products = await this.productRepository.findAllByStorageId(storageId);

    return await Promise.all(
      products.map(async (product) => {
        const batches = await this.batchRepository.findAllByProductId(product.id);
        const quantity = batches.reduce((acc, batch) => acc + batch.quantity, 0);

        return ProductDtoFactory.create(product, quantity);
      })
    );
  };

  getAllWithProducts = async (): Promise<StorageWithProductsDto[]> => {
    const storages = await this.getAll();
    const result: StorageWithProductsDto[] = [];

    for (const storage of storages) {
      const products = await this.getAllProducts(storage.id);
      result.push(StorageWithProductsDtoFactory.create(storage, products));
    }

    return result;
  };

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  remove(id: StorageDto['id']): Promise<void> {
    return this.storageRepository.remove(id);
  }

  async changeProductQuantity(
    productId: ProductDto['id'],
    quantity: ProductDto['quantity'],
    expirationDate?: Date
  ): Promise<ProductDto> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error('Product not found in storage');
    }

    const productItems = await this.productItemRepository.findAllByProductId(product.id);

    const quantityDelta = quantity - productItems.length;

    for (let i = 0; i < Math.abs(quantityDelta); i++) {
      if (quantityDelta > 0) {
        await this.productItemRepository.save(new ProductItem(uuidv4(), product.id, expirationDate));
      } else {
        await this.productItemRepository.delete(productItems[i]);
      }
    }

    await this.storageTransactionRepository.save(
      new StorageTransaction(uuidv4(), product.storageId, product.id, quantityDelta)
    );

    return ProductDtoFactory.create(product, quantity);
  }

  async removeProduct(productId: ProductDto['id']): Promise<void> {
    const storageItem = await this.productRepository.findById(productId);

    if (storageItem) {
      return this.productRepository.delete(storageItem);
    }
  }
}
