import { FC, useContext, useLayoutEffect, useState } from 'react';
import cn from 'classnames';
import { BatchDto, StorageDto } from '../../application';
import CoreContext from '../core-context.ts';

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
            <span>Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type Props = {
  data: StorageDto;
  onClickEditStorage: () => void;
  onClickAddProduct: () => void;
  onClickEditProduct: (storageProductId: BatchDto['id']) => void;
  onClickShowProduct: (storageProductId: BatchDto['id']) => void;
};

const StorageWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const [products, setProducts] = useState<BatchDto[]>([]);

  useLayoutEffect(() => {
    const updateProsuctsState = () => {
      core.queries.batch.getByStorage({ storageId: props.data.id }).then(setProducts);
    };

    core.events.product.on('productCreated', updateProsuctsState);
    core.events.product.on('productUpdated', updateProsuctsState);
    core.events.batch.on('batchCreated', updateProsuctsState);
    core.events.batch.on('batchUpdated', updateProsuctsState);

    updateProsuctsState();

    return () => {
      core.events.product.off('productCreated', updateProsuctsState);
      core.events.product.off('productUpdated', updateProsuctsState);
      core.events.batch.off('batchCreated', updateProsuctsState);
      core.events.batch.off('batchUpdated', updateProsuctsState);
    };
  }, [core]);

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div className='flex flex-col gap-3 mt-5 px-3'>
        {products.map((product) => {
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

      <div
        className='absolute bottom-0 left-0 bg-gray-100 w-full'
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className='h-10 flex justify-between items-center px-3'>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickEditStorage}>
            <span>Edit storage</span>
          </button>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddProduct}>
            <span>Add products</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageWidget;
