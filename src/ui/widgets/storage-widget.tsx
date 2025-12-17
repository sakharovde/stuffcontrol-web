import { FC, useContext, useEffect, useMemo, useState } from 'react';
import CoreContext from '../core-context.ts';
import { Button, Card, Empty, Grid, SafeArea, Space, Tag } from 'antd-mobile';
import { AddOutline, EditSOutline, EyeOutline } from 'antd-mobile-icons';
import { Batch, Storage } from '../../domain';
import type { PendingStorageChanges, PendingBatchChange } from '../../application/sync/sync-manager.ts';

type StorageItemWidgetProps = {
  data: Batch;
  pendingChange?: PendingBatchChange;
  onClickEdit: () => void;
  onClickShow: () => void;
};

const StorageProductWidget: FC<StorageItemWidgetProps> = (props) => {
  const expiresAt = props.data.expirationDate;
  const expiryLabel = expiresAt ? expiresAt.toISOString().split('T')[0] : null;
  const pendingDelta = props.pendingChange?.deltaQuantity ?? 0;
  const showDelta = pendingDelta !== 0;
  return (
    <Card className='border border-gray-100 shadow-sm storage-product-card'>
      <div className='flex justify-between gap-5'>
        <div>
          <div className='text-base font-semibold'>{props.data.name}</div>
          <div className='text-xs text-gray-500'>{`Batch #${props.data.id.slice(0, 6)}`}</div>
          {expiryLabel && (
            <div className='text-xs text-blue-500 mt-1'>
              {`Expires on ${expiryLabel}`}
            </div>
          )}
        </div>
        <div className='flex flex-col items-end gap-2'>
          <Tag color='primary' className='text-sm font-semibold px-3 py-1'>
            {props.data.quantity} pcs
          </Tag>
          {showDelta && (
            <Tag color={pendingDelta > 0 ? 'success' : 'danger'} fill='solid' className='text-[11px]'>
              {pendingDelta > 0 ? '+' : ''}
              {pendingDelta} pending
            </Tag>
          )}
          {props.pendingChange?.hasRename && (
            <Tag color='warning' fill='outline' className='text-[11px]'>
              Name change
            </Tag>
          )}
          {expiryLabel ? (
            <Tag color='warning' fill='outline' className='text-[11px]'>
              {expiryLabel}
            </Tag>
          ) : (
            <Tag color='success' fill='outline' className='text-[11px]'>
              No expiry
            </Tag>
          )}
        </div>
      </div>
      <Space className='mt-4' wrap>
        <Button size='mini' color='primary' fill='outline' onClick={props.onClickEdit} icon={<EditSOutline />}>
          Edit
        </Button>
        <Button size='mini' color='primary' fill='none' onClick={props.onClickShow} icon={<EyeOutline />}>
          Details
        </Button>
      </Space>
    </Card>
  );
};

type Props = {
  data: Storage;
  pendingChange?: PendingStorageChanges;
  onClickEditStorage: () => void;
  onClickAddProduct: () => void;
  onClickEditProduct: (batchId: Batch['id']) => void;
  onClickShowProduct: (batchId: Batch['id']) => void;
};

const StorageWidget: FC<Props> = (props) => {
  const storageId = props.data.id;
  const core = useContext(CoreContext);
  const batchManager = core.getBatchManager();
  const [batches, setBatches] = useState(batchManager.getBatches(storageId));
  const totalQuantity = useMemo(() => batches.reduce((sum, batch) => sum + batch.quantity, 0), [batches]);
  const expiringSoon = useMemo(() => {
    const now = Date.now();
    const week = 1000 * 60 * 60 * 24 * 7;
    return batches.filter(
      (batch) => batch.expirationDate && batch.expirationDate.getTime() - now <= week && batch.expirationDate.getTime() > now
    ).length;
  }, [batches]);

  useEffect(() => {
    const onStateUpdate = () => setBatches(batchManager.getBatches(storageId));
    batchManager.subscribe(onStateUpdate);
    batchManager.loadBatches(storageId); // важно: storageId из роутера/пропсов
    return () => batchManager.unsubscribe(onStateUpdate);
  }, [batchManager, storageId]);

  return (
    <div className='pb-20'>
      <Card className='mx-3 mt-3 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-xs uppercase text-gray-400'>Storage</div>
            <div className='text-2xl font-semibold text-gray-900'>{props.data.name}</div>
            <div className='text-xs text-gray-500 mt-1'>{`ID • ${props.data.id.slice(0, 6)}…${props.data.id.slice(-4)}`}</div>
          </div>
          {props.pendingChange?.pendingEvents ? (
            <Tag color='warning' bordered={false}>
              Pending sync
            </Tag>
          ) : (
            <Tag color='primary' bordered={false}>
              Synced
            </Tag>
          )}
        </div>
        <Grid columns={3} gap={8} className='mt-4'>
          <Grid.Item>
            <div className='text-xs text-gray-500'>Batches</div>
            <div className='text-lg font-semibold'>{batches.length}</div>
          </Grid.Item>
          <Grid.Item>
            <div className='text-xs text-gray-500'>Total items</div>
            <div className='text-lg font-semibold'>{totalQuantity}</div>
          </Grid.Item>
          <Grid.Item>
            <div className='text-xs text-gray-500'>Expiring soon</div>
            <div className='text-lg font-semibold text-orange-500'>{expiringSoon}</div>
          </Grid.Item>
        </Grid>
        {props.pendingChange?.pendingEvents ? (
          <div className='mt-4 text-sm text-orange-600'>
            {props.pendingChange.totalDelta
              ? `${props.pendingChange.totalDelta > 0 ? '+' : ''}${props.pendingChange.totalDelta} items pending sync`
              : 'Changes pending sync'}
          </div>
        ) : null}
      </Card>

      <div className='flex flex-col gap-3 mt-5 px-3'>
        {batches.length ? (
          batches.map((product) => (
            <StorageProductWidget
              key={product.id}
              data={product}
              pendingChange={props.pendingChange?.batches[product.id]}
              onClickEdit={() => props.onClickEditProduct(product.id)}
              onClickShow={() => props.onClickShowProduct(product.id)}
            />
          ))
        ) : (
          <Empty description='No batches yet. Add your first products to this storage.' />
        )}
      </div>

      <div className='absolute bottom-0 left-0 w-full bg-white border-t border-gray-100'>
        <div className='max-w-lg mx-auto w-full px-3 py-3'>
          <Space block justify='between'>
            <Button color='primary' fill='outline' onClick={props.onClickEditStorage} icon={<EditSOutline />}>
              Edit storage
            </Button>
            <Button color='primary' onClick={props.onClickAddProduct} icon={<AddOutline />}>
              Add products
            </Button>
          </Space>
        </div>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default StorageWidget;
