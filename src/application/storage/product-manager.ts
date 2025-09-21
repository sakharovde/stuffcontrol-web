import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductRepository } from '../../domain';

export type ProductListState = {
  productMap: Record<string, Product>;
  products: Product[];
  loadingList: boolean;
  loadingItem: boolean;
};

export default class ProductManager extends EventEmitter {
  private state: ProductListState = {
    productMap: {},
    products: [],
    loadingList: false,
    loadingItem: false,
  };

  constructor(private readonly productRepository: ProductRepository) {
    super();
  }

  private emitState = () => {
    this.emit('state', { ...this.state });
  };

  getState() {
    return this.state;
  }

  subscribe(callback: (state: ProductListState) => void) {
    this.on('state', callback);
  }

  unsubscribe(callback: (state: ProductListState) => void) {
    this.off('state', callback);
  }

  // Загрузка всех продуктов в партии
  async loadProducts(storageId: string) {
    this.state = { ...this.state, loadingList: true };
    this.emitState();

    const products = await this.productRepository.findAllByStorageId(storageId);
    const productMap = { ...this.state.productMap };
    for (const p of products) {
      productMap[p.id] = p;
    }

    this.state = { ...this.state, products, productMap, loadingList: false };
    this.emitState();

    return products;
  }

  // Создание продукта
  async createProduct(product: Omit<Product, 'id'>) {
    const newProduct = await this.productRepository.save({ ...product, id: uuidv4() });
    const productMap = { ...this.state.productMap, [newProduct.id]: newProduct };
    this.state = { ...this.state, productMap, products: [newProduct, ...this.state.products] };
    this.emitState();
    return newProduct;
  }

  // Обновление продукта
  async updateProduct(product: Product) {
    const updatedProduct = await this.productRepository.save(product);
    const productMap = { ...this.state.productMap, [updatedProduct.id]: updatedProduct };
    this.state = {
      ...this.state,
      productMap,
      products: this.state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    };
    this.emitState();
    return updatedProduct;
  }

  // Удаление продукта
  async removeProduct(productId: string) {
    await this.productRepository.delete(productId);
    delete this.state.productMap[productId];
    this.state = {
      ...this.state,
      products: this.state.products.filter((p) => p.id !== productId),
    };
    this.emitState();
  }

  // Получение одного продукта
  getProduct(productId: string) {
    return this.state.productMap[productId] || null;
  }
}
