import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  ProductNameEmptySpecification,
  ProductRepository,
  Storage,
  StorageItem,
  StorageItemRepository,
  StorageNameEmptySpecification,
  StorageRepository,
  StorageTransaction,
  StorageTransactionRepository,
} from '../../domain';
import StorageWithProductsDto, { StorageWithProductsDtoFactory } from '../dto/storage-with-products-dto.ts';
import StorageProductDto, { StorageProductDtoFactory } from '../dto/storage-product-dto.ts';
import StorageDto, { StorageDtoFactory } from '../dto/storage-dto.ts';

export default class StorageService {
  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly storageItemRepository: StorageItemRepository,
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

  getAllProducts = async (storageId: StorageDto['id']): Promise<StorageProductDto[]> => {
    const storageItems = await this.storageItemRepository.findAllByStorageId(storageId);
    const products = await this.productRepository.getAll();

    return storageItems.reduce((acc, storageItem) => {
      const product = products.find((product) => product.id === storageItem.productId);

      if (!product) return acc;

      return [...acc, StorageProductDtoFactory.create(storageItem, product)];
    }, [] as StorageProductDto[]);
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

  getAllChangedProducts = async (storageId: Storage['id']): Promise<StorageProductDto[]> => {
    const storage = await this.storageRepository.findById(storageId);
    if (!storage) {
      throw new Error('Storage not found');
    }

    const storageItems = await this.storageItemRepository.findAllByStorageId(storageId);
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);
    const products = await this.productRepository.getAll();

    const changedStorageItems = storageItems.reduce((acc, storageItem) => {
      const unappliedTransaction = unappliedTransactions.find(
        (transaction) => transaction.productId === storageItem.productId
      );

      if (!unappliedTransaction) {
        return acc;
      }

      storageItem.quantity += unappliedTransaction.quantityChange;

      return [...acc, storageItem];
    }, [] as StorageItem[]);

    return changedStorageItems.reduce((acc, storageItem) => {
      const product = products.find((product) => product.id === storageItem.productId);

      if (!product) return acc;

      return [...acc, StorageProductDtoFactory.create(storageItem, product)];
    }, [] as StorageProductDto[]);
  };

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  saveProductsChanges = async (storageId: Storage['id']): Promise<void> => {
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);
    const storageItems = await this.storageItemRepository.findAllByStorageId(storageId);

    await Promise.all(
      unappliedTransactions.map(async (transaction) => {
        const storageItem = storageItems.find((item) => item.productId === transaction.productId);
        if (!storageItem) {
          throw new Error('Storage item not found');
        }

        storageItem.quantity += transaction.quantityChange;
        await this.storageItemRepository.save(storageItem);

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
    productName: StorageProductDto['name'],
    quantity: StorageProductDto['quantity']
  ): Promise<StorageProductDto> {
    const isNameEmpty = await this.productNameEmptySpecification.isSatisfiedBy(productName);

    if (isNameEmpty) {
      throw new Error('Product name cannot be empty');
    }

    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const product = await this.productRepository.save(new Product(uuidv4(), productName));
    const storageItem = await this.storageItemRepository.save(new StorageItem(uuidv4(), storageId, product.id, 0));
    const storageProduct = StorageProductDtoFactory.create(storageItem, product);

    await this.changeProductQuantity(storageProduct.id, quantity);

    return storageProduct;
  }

  async changeProductQuantity(
    productId: StorageProductDto['id'],
    quantity: StorageProductDto['quantity']
  ): Promise<StorageProductDto> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const storageItem = await this.storageItemRepository.findById(productId);

    if (!storageItem) {
      throw new Error('Product not found in storage');
    }

    const product = await this.productRepository.findById(storageItem.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const quantityDelta = quantity - storageItem.quantity;

    const storageTransaction = await this.storageTransactionRepository.findUnappliedByStorageIdAndProductId(
      storageItem.storageId,
      storageItem.productId
    );

    if (!quantityDelta && storageTransaction) {
      await this.storageTransactionRepository.remove(storageTransaction);
    } else if (storageTransaction) {
      storageTransaction.quantityChange = quantityDelta;
      await this.storageTransactionRepository.save(storageTransaction);
    } else {
      await this.storageTransactionRepository.save(
        new StorageTransaction(uuidv4(), storageItem.storageId, storageItem.productId, quantityDelta, 'pending')
      );
    }

    return StorageProductDtoFactory.create(storageItem, product);
  }

  async removeProduct(productId: StorageProductDto['id']): Promise<void> {
    const storageItem = await this.storageItemRepository.findById(productId);

    if (storageItem) {
      return this.storageItemRepository.delete(storageItem);
    }
  }
}
