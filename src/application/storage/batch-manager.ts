import { EventEmitter } from 'events';
import { Batch, BatchRepository } from '../../domain';
import { v7 as uuidv7 } from 'uuid';

type BatchListState = {
  batchMap: Record<string, Batch>;
  // storageId -> ids батчей (кэш списков)
  batchIdsByStorage: Record<string, string[]>;
  // storageId -> loading
  loadingByStorage: Record<string, boolean>;
};

export default class BatchManager extends EventEmitter {
  private state: BatchListState = {
    batchMap: {},
    batchIdsByStorage: {},
    loadingByStorage: {},
  };

  constructor(private readonly batchRepository: BatchRepository) {
    super();
  }

  private emitState = () => {
    this.emit('state', { ...this.state });
  };

  getState() {
    return this.state;
  }

  subscribe(cb: (state: BatchListState) => void) {
    this.on('state', cb);
  }

  unsubscribe(cb: (state: BatchListState) => void) {
    this.off('state', cb);
  }

  /** Синхронно достать список батчей из кэша */
  getBatches(storageId: string): Batch[] {
    const ids = this.state.batchIdsByStorage[storageId] ?? [];
    return ids.map((id) => this.state.batchMap[id]).filter(Boolean);
  }

  getBatchById(id: Batch['id']): Batch | null {
    return this.state.batchMap[id] ?? null;
  }

  isLoading(storageId: string) {
    return this.state.loadingByStorage[storageId] ?? false;
  }

  /** Загружает только если ещё не загружали (как на главной, но per-storage) */
  async loadBatches(storageId: string, opts?: { force?: boolean }) {
    const alreadyLoaded = !!this.state.batchIdsByStorage[storageId]?.length;
    if (alreadyLoaded && !opts?.force) {
      return this.getBatches(storageId);
    }

    this.state = {
      ...this.state,
      loadingByStorage: { ...this.state.loadingByStorage, [storageId]: true },
    };
    this.emitState();

    const batches = await this.batchRepository.findAllByStorageId(storageId);

    const batchMap = { ...this.state.batchMap };
    const ids: string[] = [];

    for (const b of batches) {
      batchMap[b.id] = b;
      ids.push(b.id);
    }

    this.state = {
      ...this.state,
      batchMap,
      batchIdsByStorage: { ...this.state.batchIdsByStorage, [storageId]: ids },
      loadingByStorage: { ...this.state.loadingByStorage, [storageId]: false },
    };
    this.emitState();

    return batches;
  }

  async createBatch(args: Omit<Batch, 'id' | 'createdAt'>) {
    const newBatch = await this.batchRepository.save({ ...args, id: uuidv7(), createdAt: new Date() });

    const batchMap = { ...this.state.batchMap, [newBatch.id]: newBatch };
    const existing = this.state.batchIdsByStorage[newBatch.storageId] ?? [];
    const ids = [newBatch.id, ...existing];

    this.state = {
      ...this.state,
      batchMap,
      batchIdsByStorage: { ...this.state.batchIdsByStorage, [newBatch.storageId]: ids },
    };
    this.emitState();

    return newBatch;
  }

  async updateBatch(batch: Batch) {
    const updated = await this.batchRepository.save(batch);
    this.state = { ...this.state, batchMap: { ...this.state.batchMap, [updated.id]: updated } };
    this.emitState();
    return updated;
  }

  async removeBatch(batchId: string) {
    const batch = this.state.batchMap[batchId];
    await this.batchRepository.delete(batchId);

    const { [batchId]: _, ...restMap } = this.state.batchMap;

    let batchIdsByStorage = this.state.batchIdsByStorage;
    if (batch) {
      const ids = batchIdsByStorage[batch.storageId] ?? [];
      batchIdsByStorage = {
        ...batchIdsByStorage,
        [batch.storageId]: ids.filter((id) => id !== batchId),
      };
    }

    this.state = { ...this.state, batchMap: restMap, batchIdsByStorage };
    this.emitState();
  }
}
