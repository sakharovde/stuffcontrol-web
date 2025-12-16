import { EventEmitter } from 'events';
import { Batch, BatchRepository } from '../../domain';
import { v7 as uuidv7 } from 'uuid';

type BatchListState = {
  batchMap: Record<string, Batch>;
  batches: Batch[];
  loadingList: boolean;
  loadingItem: boolean;
};

export default class BatchManager extends EventEmitter {
  private state: BatchListState = {
    batchMap: {},
    batches: [],
    loadingList: false,
    loadingItem: false,
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

  subscribe(callback: (state: BatchListState) => void) {
    this.on('state', callback);
  }

  unsubscribe(callback: (state: BatchListState) => void) {
    this.off('state', callback);
  }

  async loadBatches(storageId: string) {
    this.state = { ...this.state, loadingList: true };
    this.emitState();

    const batches = await this.batchRepository.findAllByStorageId(storageId);
    const batchMap = { ...this.state.batchMap };
    for (const batch of batches) {
      batchMap[batch.id] = batch;
    }

    this.state = { ...this.state, batches, batchMap, loadingList: false };
    this.emitState();

    return batches;
  }

  async createBatch(batch: Omit<Batch, 'id'>) {
    const newBatch = await this.batchRepository.save({ ...batch, id: uuidv7() });
    const batchMap = { ...this.state.batchMap, [newBatch.id]: newBatch };
    this.state = { ...this.state, batchMap, batches: [newBatch, ...this.state.batches] };
    this.emitState();
    return newBatch;
  }

  async updateBatch(batch: Batch) {
    const updatedBatch = await this.batchRepository.save(batch);
    const batchMap = { ...this.state.batchMap, [updatedBatch.id]: updatedBatch };
    this.state = {
      ...this.state,
      batchMap,
      batches: this.state.batches.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)),
    };
    this.emitState();
    return updatedBatch;
  }

  async removeBatch(batchId: string) {
    await this.batchRepository.delete(batchId);
    delete this.state.batchMap[batchId];
    this.state = {
      ...this.state,
      batches: this.state.batches.filter((b) => b.id !== batchId),
    };
    this.emitState();
  }
}
