import { EventEmitter } from 'events';

interface Events {
  productCreated: void;
  productUpdated: void;
  productDeleted: void;
}

export default class extends EventEmitter {
  emit<K extends keyof Events>(event: K, ...args: Events[K][]): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof Events>(event: K, listener: (...args: Events[K][]) => void): this {
    return super.on(event, listener);
  }

  once<K extends keyof Events>(event: K, listener: (...args: Events[K][]) => void): this {
    return super.once(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: (...args: Events[K][]) => void): this {
    return super.off(event, listener);
  }
}
