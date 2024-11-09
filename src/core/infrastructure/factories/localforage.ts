import LocalForage from 'localforage';

interface LocalForageConfig {
  name: string;
  storeName: string;
  description?: string;
}

const mapDriver: LocalForageDriver & { _storage: Map<string, never> } = {
  _driver: 'mapDriver',
  _storage: new Map<never, never>(),

  _initStorage: function () {
    this._storage = new Map<never, never>();
    return Promise.resolve();
  },
  getItem: function (key: string) {
    return Promise.resolve(this._storage.get(key) || null);
  },
  setItem: function (key, value: never) {
    this._storage.set(key, value);
    return Promise.resolve(value);
  },
  removeItem: function (key) {
    this._storage.delete(key);
    return Promise.resolve();
  },
  clear: function () {
    this._storage.clear();
    return Promise.resolve();
  },
  length: function () {
    return Promise.resolve(this._storage.size);
  },
  key: function (n: never) {
    const keys = Array.from(this._storage.keys());
    return Promise.resolve(keys[n]);
  },
  keys: function () {
    return Promise.resolve(Array.from(this._storage.keys()));
  },

  iterate(
    iteratee: (value: never, key: string, iterationNumber: number) => never,
    callback?: (err: null, result: never) => void
  ): Promise<never> {
    let iterationNumber = 0;
    let result: never | undefined;

    for (const [key, value] of this._storage.entries()) {
      result = iteratee(value, key, iterationNumber++);
      if (result !== undefined) {
        break;
      }
    }

    if (callback) {
      callback(null, result as never);
    }

    return Promise.resolve(result as never);
  },
};

LocalForage.defineDriver(mapDriver);

export default class LocalForageFactory {
  static createInstance(config: LocalForageConfig): LocalForage {
    return LocalForage.createInstance({
      driver: process.env.NODE_ENV === 'test' ? 'mapDriver' : undefined,
      name: config.name,
      storeName: config.storeName,
      description: config.description,
    });
  }
}
