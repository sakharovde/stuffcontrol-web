import { Storage, StorageRepository } from '../../domain';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import StorageInstance from './storage-instance.ts';

type StorageListState = {
  storageMap: Record<Storage['id'], Storage>;
  storages: Storage[];
  loading: boolean;
};

export default class StorageManager extends EventEmitter {
  private storageInstances = new Map<Storage['id'], StorageInstance>();
  private state: StorageListState = { storages: [], loading: false, storageMap: {} };

  constructor(private readonly storageRepository: StorageRepository) {
    super();
  }

  private emitState = () => {
    this.emit('state', this.state);
  };

  getState() {
    return this.state;
  }

  subscribe(callback: (state: StorageListState) => void) {
    this.on('state', callback);
  }

  unsubscribe(callback: (state: StorageListState) => void) {
    this.off('state', callback);
  }

  getStorage(storageId: Storage['id']) {
    return this.state.storageMap[storageId] || null;
  }

  getStorageInstance(storageId: Storage['id']) {
    if (!this.storageInstances.has(storageId)) {
      this.storageInstances.set(storageId, new StorageInstance(storageId));
    }
    return this.storageInstances.get(storageId)!;
  }

  loadStorages = async () => {
    this.state = { ...this.state, loading: true };
    this.emitState();

    const storages = await this.storageRepository.getAll();

    const storageMap = { ...this.state.storageMap };

    for (const storage of storages) {
      storageMap[storage.id] = storage;
    }

    this.state = {
      ...this.state,
      storages,
      loading: false,
      storageMap,
    };
    this.emitState();

    return storages;
  };

  loadStorage = async (args: { storageId: string }) => {
    this.state = { ...this.state, loading: true };
    this.emitState();

    const storage = await this.storageRepository.findById(args.storageId);

    if (!storage) {
      this.state = { ...this.state, loading: false };
      this.emitState();
      return;
    }

    this.state = {
      ...this.state,
      loading: false,
      storageMap: {
        ...this.state.storageMap,
        [storage.id]: storage,
      },
    };
    this.emitState();

    return storage;
  };

  createStorage = async (args: { name: Storage['name'] }) => {
    const isNameEmpty = !args.name?.trim();
    if (isNameEmpty) {
      throw new Error('Storage name cannot be empty');
    }

    const storage = await this.storageRepository.save(new Storage(uuidv4(), args.name));

    this.state = {
      ...this.state,
      storageMap: { ...this.state.storageMap, [storage.id]: storage },
      storages: [storage, ...this.state.storages],
    };
    this.emitState();

    return storage;
  };

  removeStorage = async (args: { id: Storage['id'] }) => {
    await this.storageRepository.remove(args.id);
    delete this.state.storageMap[args.id];
    this.state = {
      ...this.state,
      storages: this.state.storages.filter((storage) => storage.id !== args.id),
    };
    this.emitState();
  };

  updateStorage = async (args: { storage: Storage }) => {
    const updatedStorage = await this.storageRepository.save(args.storage);
    this.state = {
      ...this.state,
      storageMap: { ...this.state.storageMap, [updatedStorage.id]: updatedStorage },
      storages: this.state.storages.map((storage) => (storage.id === updatedStorage.id ? updatedStorage : storage)),
    };
    this.emitState();

    return updatedStorage;
  };
}
