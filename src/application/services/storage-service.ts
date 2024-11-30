import { v4 as uuidv4 } from 'uuid';
import {
  ProductNameEmptySpecification,
  Storage,
  Product,
  ProductRepository,
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
    private readonly productNameEmptySpecification: ProductNameEmptySpecification
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
    const storageItems = await this.productRepository.findAllByStorageId(storageId);

    return storageItems.map((storageItem) => ProductDtoFactory.create(storageItem));
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

  getAllChangedProducts = async (storageId: Storage['id']): Promise<ProductDto[]> => {
    const storage = await this.storageRepository.findById(storageId);
    if (!storage) {
      throw new Error('Storage not found');
    }

    const storageItems = await this.productRepository.findAllByStorageId(storageId);
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);

    const changedStorageItems = storageItems.reduce((acc, storageItem) => {
      const unappliedTransaction = unappliedTransactions.find(
        (transaction) => transaction.productId === storageItem.id
      );

      if (!unappliedTransaction) {
        return acc;
      }

      storageItem.quantity += unappliedTransaction.quantityChange;

      return [...acc, storageItem];
    }, [] as Product[]);

    return changedStorageItems.map((storageItem) => ProductDtoFactory.create(storageItem));
  };

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  saveProductsChanges = async (storageId: Storage['id']): Promise<void> => {
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);
    const storageItems = await this.productRepository.findAllByStorageId(storageId);

    await Promise.all(
      unappliedTransactions.map(async (transaction) => {
        const storageItem = storageItems.find((item) => item.id === transaction.productId);
        if (!storageItem) {
          throw new Error('Storage item not found');
        }

        storageItem.quantity += transaction.quantityChange;
        await this.productRepository.save(storageItem);

        transaction.state = 'applied';
        await this.storageTransactionRepository.save(transaction);
      })
    );
  };

  remove(id: StorageDto['id']): Promise<void> {
    return this.storageRepository.remove(id);
  }

  async createProduct(
    storageId: StorageDto['id'],
    productName: ProductDto['name'],
    quantity: ProductDto['quantity']
  ): Promise<ProductDto> {
    const isNameEmpty = await this.productNameEmptySpecification.isSatisfiedBy(productName);

    if (isNameEmpty) {
      throw new Error('Product name cannot be empty');
    }

    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem = await this.productRepository.save(new Product(uuidv4(), storageId, productName, 0));
    const storageProduct = ProductDtoFactory.create(storageItem);

    await this.changeProductQuantity(storageProduct.id, quantity);

    return storageProduct;
  }

  async changeProductQuantity(productId: ProductDto['id'], quantity: ProductDto['quantity']): Promise<ProductDto> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem = await this.productRepository.findById(productId);

    if (!storageItem) {
      throw new Error('Product not found in storage');
    }

    const quantityDelta = quantity - storageItem.quantity;

    const storageTransaction = await this.storageTransactionRepository.findUnappliedByProductId(storageItem.id);

    if (!quantityDelta && storageTransaction) {
      await this.storageTransactionRepository.remove(storageTransaction);
    } else if (storageTransaction) {
      storageTransaction.quantityChange = quantityDelta;
      await this.storageTransactionRepository.save(storageTransaction);
    } else {
      await this.storageTransactionRepository.save(
        new StorageTransaction(uuidv4(), storageItem.storageId, storageItem.id, quantityDelta, 'pending')
      );
    }

    return ProductDtoFactory.create(storageItem);
  }

  async removeProduct(productId: ProductDto['id']): Promise<void> {
    const storageItem = await this.productRepository.findById(productId);

    if (storageItem) {
      return this.productRepository.delete(storageItem);
    }
  }
}
