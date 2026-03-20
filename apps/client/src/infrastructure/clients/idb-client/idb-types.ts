type IdbUUID = string;
type IdbTimestamp = number;

export interface IdbSyncSession {
  id: IdbUUID;
  storageId: IdbUUID;
  snapshot: Array<{
    storageId: IdbUUID;
    productId: IdbUUID;
    batchId: IdbUUID;
    productName: string;
    quantity: number;
    expiryDate?: string;
    manufactureDate?: string;
    shelfLifeDays?: number;
  }>;
  createdAt: IdbTimestamp;
}

export interface IdbTransaction {
  id: IdbUUID;
  storageId: IdbUUID;
  productId?: IdbUUID;
  batchId?: IdbUUID;
  eventType:
    | 'addProducts'
    | 'removeProducts'
    | 'changeProductName'
    | 'createStorage'
    | 'deleteStorage'
    | 'changeStorageName';
  data: {
    expiryDate?: IdbTimestamp;
    manufactureDate?: IdbTimestamp;
    productName?: string;
    quantity?: number;
    shelfLifeDays?: number;
    storageName?: string;
  };
  createdAt: IdbTimestamp;
  syncSessionId: IdbSyncSession['id'] | null;
}
