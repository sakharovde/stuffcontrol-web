import type {
  HttpProductInfo,
  HttpSnapshotItem,
  HttpStorageEvent,
  HttpStorageInfo,
  HttpSyncRequest,
  HttpSyncSession,
} from './http-types.ts';

export type HttpClientOptions = {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
};

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export default class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions = {}) {
    const envBaseUrl = import.meta.env.VITE_SERVER_ORIGIN;
    this.baseUrl = (options.baseUrl ?? envBaseUrl ?? '').replace(/\/$/, '');
    this.defaultHeaders = { ...DEFAULT_HEADERS, ...(options.defaultHeaders ?? {}) };
  }

  getStorageEvents = async (): Promise<HttpStorageEvent[]> => {
    return this.request<HttpStorageEvent[]>('/api/storage-events');
  };

  getStorages = async (): Promise<HttpStorageInfo[]> => {
    return this.request<HttpStorageInfo[]>('/api/storages');
  };

  getProducts = async (): Promise<HttpProductInfo[]> => {
    return this.request<HttpProductInfo[]>('/api/products');
  };

  getBatches = async (): Promise<HttpSnapshotItem[]> => {
    return this.request<HttpSnapshotItem[]>('/api/batches');
  };

  getSyncSessions = async (): Promise<HttpSyncSession[]> => {
    return this.request<HttpSyncSession[]>('/api/sync-sessions');
  };

  createSyncSession = async (payload: HttpSyncRequest): Promise<HttpSyncSession | null> => {
    return this.request<HttpSyncSession | null>('/api/sync-sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  private buildUrl(path: string): string {
    if (!this.baseUrl) {
      return path;
    }
    return `${this.baseUrl}${path}`;
  }

  private mergeHeaders(extra?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders };

    if (!extra) {
      return headers;
    }

    if (Array.isArray(extra)) {
      extra.forEach(([key, value]) => {
        headers[key] = value;
      });
      return headers;
    }

    if (typeof Headers !== 'undefined' && extra instanceof Headers) {
      extra.forEach((value, key) => {
        headers[key] = value;
      });
      return headers;
    }

    return { ...headers, ...(extra as Record<string, string>) };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: this.mergeHeaders(init.headers),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      throw new Error(
        `HTTP ${response.status} ${response.statusText}${errorPayload ? ` - ${errorPayload}` : ''}`.trim()
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    const textPayload = await response.text();
    return textPayload ? (textPayload as T) : (undefined as T);
  }
}
