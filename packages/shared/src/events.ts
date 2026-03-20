export const STORAGE_EVENT_TYPES = [
  'addProducts',
  'removeProducts',
  'changeProductName',
  'createStorage',
  'deleteStorage',
  'changeStorageName',
] as const;

export type StorageEventType = (typeof STORAGE_EVENT_TYPES)[number];
