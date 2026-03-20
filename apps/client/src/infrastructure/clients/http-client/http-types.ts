export type HttpStorageEventType =
  | 'addProducts'
  | 'removeProducts'
  | 'changeProductName'
  | 'createStorage'
  | 'deleteStorage'
  | 'changeStorageName';

export interface HttpStorageEventData {
  expiryDate?: string | null;
  manufactureDate?: string | null;
  productName?: string | null;
  quantity?: number | null;
  shelfLifeDays?: number | null;
  storageName?: string | null;
}

export interface HttpStorageEvent {
  id: string;
  storageId: string;
  productId?: string | null;
  batchId?: string | null;
  eventType: HttpStorageEventType;
  data: HttpStorageEventData;
  createdAt: string;
  syncSessionId?: string | null;
}

export interface HttpSnapshotItem {
  storageId: string;
  productId: string;
  batchId: string;
  productName: string;
  quantity: number;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  shelfLifeDays?: number | null;
}

export interface HttpSyncEvent {
  productId: string;
  batchId: string;
  eventType: HttpStorageEventType;
  quantity?: number;
  productName?: string;
  storageName?: string;
  expiryDate?: string;
  manufactureDate?: string;
  shelfLifeDays?: number;
}

export interface HttpSyncRequest {
  storageId: string;
  events: HttpSyncEvent[];
}

export interface HttpSyncSession {
  id: string;
  storageId: string;
  snapshot: HttpSnapshotItem[];
  createdAt: string;
  storageEvents?: HttpStorageEvent[];
}

export interface HttpStorageInfo {
  storageId: string;
  storageName?: string | null;
  createdAt: string;
}

export interface HttpProductInfo {
  productId: string;
  productName?: string | null;
  shelfLifeDays?: string | null;
  createdAt: string;
}
