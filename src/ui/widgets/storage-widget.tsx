import { FC, useContext } from 'react';
import Storage from '../../core/modules/storage/domain/models/storage.ts';
import CoreContext from '../core-context.ts';
import { useQuery } from '@tanstack/react-query';
import StorageItem from '../../core/modules/storage/domain/models/storage-item.ts';
import cn from 'classnames';

type StorageItemWidgetProps = {
  data: StorageItem;
};

const StorageItemWidget: FC<StorageItemWidgetProps> = (props) => {
  const core = useContext(CoreContext);
  const productQuery = useQuery({
    queryKey: ['products', props.data.productId],
    queryFn: () => core.useCases.product.get.execute(props.data.productId),
  });

  if (!productQuery.data) {
    return null;
  }

  return (
    <div className='flex justify-between'>
      <div>{productQuery.data.name}</div>
      <div>{props.data.quantity}</div>
    </div>
  );
};

type Props = {
  data: Storage;
  onClickEditStorage: () => void;
  onClickAddProduct: () => void;
  onClickEditProduct: (storageItemId: StorageItem['id']) => void;
};

const StorageWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);

  const queryKey = ['storage-items', props.data.id];
  const itemsQuery = useQuery({ queryKey, queryFn: () => core.useCases.storage.getItems.execute(props.data.id) });

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div>
        {itemsQuery.data?.map((item, index) => (
          <div key={item.id} className={cn('px-3', 'cursor-pointer')} onClick={() => props.onClickEditProduct(item.id)}>
            <div className={cn('py-5', { 'border-t': !!index })}>
              <StorageItemWidget data={item} />
            </div>
          </div>
        ))}
      </div>

      <div className='absolute bottom-0 left-0 h-10 bg-gray-100 w-full flex justify-between items-center px-3'>
        <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickEditStorage}>
          <span>Edit storage</span>
        </button>
        <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddProduct}>
          <span>Add product</span>
        </button>
      </div>
    </div>
  );
};

export default StorageWidget;
