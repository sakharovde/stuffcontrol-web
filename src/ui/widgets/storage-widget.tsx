import { FC, useContext, useEffect, useState } from 'react';
import cn from 'classnames';
import { BatchDto } from '../../application';
import CoreContext from '../core-context.ts';
import { SafeArea } from 'antd-mobile';
import { Batch, Storage } from '../../domain';

type StorageItemWidgetProps = {
  data: BatchDto;
  onClickEdit: () => void;
  onClickShow: () => void;
};

const StorageProductWidget: FC<StorageItemWidgetProps> = (props) => {
  return (
    <div className={cn('py-1', 'px-3', 'rounded-md', 'bg-gray-100', 'border', 'border-gray-50')}>
      <div className='flex justify-between gap-5'>
        <div className='flex-1'>
          <div className='text-sm'>{props.data.name}</div>
          {props.data.expirationDate && (
            <div className='text-gray-500 text-xs'>{`Expires on ${props.data.expirationDate.toISOString().split('T')[0]}`}</div>
          )}
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex gap-2'>
            <div className={cn('font-semibold', 'text-lg', 'flex', 'items-center', 'justify-center', 'text-gray-500')}>
              {props.data.quantity}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className='flex justify-between gap-1'>
          <button
            type='button'
            className={cn('flex', 'items-center', 'gap-1', 'text-blue-600', 'font-medium', 'text-xs')}
            onClick={props.onClickEdit}
          >
            <span>Edit</span>
          </button>
          <button
            type='button'
            className={cn('flex', 'items-center', 'gap-1', 'text-blue-600', 'font-medium', 'text-xs')}
            onClick={props.onClickShow}
          >
            <span style={{ pointerEvents: 'none' }}>Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type Props = {
  data: Storage;
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

  useEffect(() => {
    const onStateUpdate = () => setBatches(batchManager.getBatches(storageId));
    batchManager.subscribe(onStateUpdate);
    batchManager.loadBatches(storageId); // важно: storageId из роутера/пропсов
    return () => batchManager.unsubscribe(onStateUpdate);
  }, [batchManager, storageId]);

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div className='flex flex-col gap-3 mt-5 px-3'>
        {batches.map((product) => {
          return (
            <StorageProductWidget
              key={product.id}
              data={product}
              onClickEdit={() => props.onClickEditProduct(product.id)}
              onClickShow={() => props.onClickShowProduct(product.id)}
            />
          );
        })}
      </div>

      <div className='absolute bottom-0 left-0 bg-gray-100 w-full'>
        <div className='h-10 flex justify-between items-center px-3'>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickEditStorage}>
            <span>Edit storage</span>
          </button>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddProduct}>
            <span>Add products</span>
          </button>
        </div>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default StorageWidget;
