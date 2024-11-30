import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  ProductItem,
  ProductItemRepository,
  ProductNameEmptySpecification,
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
    private readonly productNameEmptySpecification: ProductNameEmptySpecification,
    private readonly productItemRepository: ProductItemRepository
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
        const productItems = await this.productItemRepository.findAllByProductId(product.id);
        return ProductDtoFactory.create(product, productItems.length);
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

  getAllChangedProducts = async (storageId: Storage['id']): Promise<ProductDto[]> => {
    const storage = await this.storageRepository.findById(storageId);
    if (!storage) {
      throw new Error('Storage not found');
    }

    const products = await this.productRepository.findAllByStorageId(storageId);
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);

    const changedProductsMeta = products.reduce(
      (acc, product) => {
        const unappliedTransaction = unappliedTransactions.find((transaction) => transaction.productId === product.id);

        if (!unappliedTransaction) {
          return acc;
        }

        return [...acc, { product, quantityChange: unappliedTransaction.quantityChange }];
      },
      [] as Array<{ product: Product; quantityChange: number }>
    );

    return await Promise.all(
      changedProductsMeta.map(async ({ product, quantityChange }) => {
        const productItems = await this.productItemRepository.findAllByProductId(product.id);

        return ProductDtoFactory.create(product, productItems.length + quantityChange);
      })
    );
  };

  update(storage: Storage): Promise<Storage> {
    return this.storageRepository.save(storage);
  }

  saveProductsChanges = async (storageId: Storage['id']): Promise<void> => {
    const unappliedTransactions = await this.storageTransactionRepository.findAllUnappliedByStorageId(storageId);

    await Promise.all(
      unappliedTransactions.map(async (transaction) => {
        const productItems = await this.productItemRepository.findAllByProductId(transaction.productId);

        for (let i = 0; i < Math.abs(transaction.quantityChange); i++) {
          if (transaction.quantityChange > 0) {
            await this.productItemRepository.save(new ProductItem(uuidv4(), transaction.productId, null));
          } else {
            await this.productItemRepository.delete(productItems[i]);
          }
        }

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

    const product = await this.productRepository.save(new Product(uuidv4(), storageId, productName));

    return await this.changeProductQuantity(product.id, quantity);
  }

  async changeProductQuantity(productId: ProductDto['id'], quantity: ProductDto['quantity']): Promise<ProductDto> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error('Product not found in storage');
    }

    const productItems = await this.productItemRepository.findAllByProductId(product.id);

    const quantityDelta = quantity - productItems.length;

    const storageTransaction = await this.storageTransactionRepository.findUnappliedByProductId(product.id);

    if (!quantityDelta && storageTransaction) {
      await this.storageTransactionRepository.remove(storageTransaction);
    } else if (storageTransaction) {
      storageTransaction.quantityChange = quantityDelta;
      await this.storageTransactionRepository.save(storageTransaction);
    } else {
      await this.storageTransactionRepository.save(
        new StorageTransaction(uuidv4(), product.storageId, product.id, quantityDelta, 'pending')
      );
    }

    return ProductDtoFactory.create(product, quantity);
  }

  async removeProduct(productId: ProductDto['id']): Promise<void> {
    const storageItem = await this.productRepository.findById(productId);

    if (storageItem) {
      return this.productRepository.delete(storageItem);
    }
  }
}
