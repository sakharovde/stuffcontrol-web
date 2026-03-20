import { RouteGenericInterface, RouteHandler } from 'fastify';
import DBDataSource from '../../../db/data-source';
import SyncSession from '../../../db/entities/sync-session';
import StorageEvent from '../../../db/entities/storage-event';
import applyEventToSnapshot from '../helpers/applyEventToSnapshot';
import type { HttpSyncEvent, HttpSyncRequest } from 'shared';

interface SyncRoute extends RouteGenericInterface {
  Body: HttpSyncRequest;
}

const handler: RouteHandler<SyncRoute> = async (req, reply) => {
  const storageId = req.body.storageId;

  if (!req.body.events || !req.body.events?.length) {
    return reply.status(400).send({
      message: 'At least one event must be provided',
    });
  }

  const mapBodyItemToData = (body: HttpSyncEvent) => ({
    storageId: storageId,
    productId: body.productId,
    batchId: body.batchId,
    eventType: body.eventType,
    data: {
      ...(body.quantity ? { quantity: body.quantity } : {}),
      ...(body.productName ? { productName: body.productName } : {}),
      ...(body.storageName ? { storageName: body.storageName } : {}),
      ...(body.expiryDate ? { expiryDate: body.expiryDate } : {}),
      ...(body.manufactureDate
        ? { manufactureDate: body.manufactureDate }
        : {}),
    },
  });

  let newStorageEvents = DBDataSource.manager.create(
    StorageEvent,
    req.body.events.map(mapBodyItemToData)
  );

  const latestSyncSession = await DBDataSource.manager.findOne(SyncSession, {
    where: { storageId },
    order: { createdAt: 'DESC' },
  });
  const latestSnapshot = latestSyncSession?.snapshot || [];

  const newSnapshot = newStorageEvents.reduce(
    (snapshot, event) => applyEventToSnapshot(snapshot, event),
    latestSnapshot
  );

  await DBDataSource.manager.transaction(async (transactionEntityManager) => {
    newStorageEvents = await transactionEntityManager.save(newStorageEvents);

    let newSyncSession = DBDataSource.manager.create(SyncSession, {
      storageId,
      snapshot: newSnapshot,
      storageEvents: newStorageEvents,
    });
    await transactionEntityManager.save(newSyncSession);
  });

  if (newStorageEvents.some(({ eventType }) => eventType === 'deleteStorage')) {
    await DBDataSource.manager.transaction(async (transactionEntityManager) => {
      await transactionEntityManager.delete(SyncSession, {
        where: { storageId },
      });
      await transactionEntityManager.delete(StorageEvent, {
        where: { storageId },
      });
    });
  }

  return DBDataSource.manager.findOne(SyncSession, {
    where: { storageId },
    order: { createdAt: 'DESC' },
    relations: ['storageEvents'],
  });
};

export default handler;
