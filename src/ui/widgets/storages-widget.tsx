import { FC, useContext } from 'react';
import CoreContext from '../core-context.ts';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import Storage from '../../core/modules/storage/domain/models/storage.ts';
import StorageItem from '../../core/modules/storage/domain/models/storage-item.ts';

type StorageItemProps = {
  data: StorageItem;
};
const StorageItemWidget: FC<StorageItemProps> = (props) => {
  const core = useContext(CoreContext);
  const productQuery = useQuery({
    queryKey: ['products', props.data.productId],
    queryFn: () => core.useCases.product.get.execute(props.data.productId),
  });

  if (!productQuery.data) {
    return null;
  }

  return (
    <div className='flex text-xs justify-between text-gray-400'>
      <div>{productQuery.data.name}</div>
      <div>{props.data.quantity}</div>
    </div>
  );
};

type StorageCardWidgetProps = {
  data: Storage;
  onClick: () => void;
};

const StorageCardWidget: FC<StorageCardWidgetProps> = (props) => {
  const core = useContext(CoreContext);

  const queryKey = ['storage-items', props.data.id];
  const itemsQuery = useQuery({ queryKey, queryFn: () => core.useCases.storage.getItems.execute(props.data.id) });

  return (
    <div className='border rounded-md p-3 cursor-pointer' onClick={props.onClick}>
      <div className='font-semibold'>{props.data.name}</div>
      {!itemsQuery.data && <div className='text-gray-400'>Empty</div>}
      {itemsQuery.data && (
        <div>
          {itemsQuery.data.map((item) => (
            <StorageItemWidget key={item.id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
};

type StoragesWidgetProps = {
  data?: Storage[];
  onClickAddStorage: () => void;
  onClickStorageCard: (storageId: Storage['id']) => void;
};

const StoragesWidget: FC<StoragesWidgetProps> = (props) => {
  return (
    <>
      <div className='p-3'>
        <div className='flex gap-5 flex-col'>
          {props.data?.map((storage) => (
            <StorageCardWidget key={storage.id} data={storage} onClick={() => props.onClickStorageCard(storage.id)} />
          ))}
        </div>
      </div>
      <div className='absolute bottom-0 left-0 h-10 bg-gray-100 w-full flex items-center px-3'>
        <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddStorage}>
          <FontAwesomeIcon icon={faCirclePlus} />
          <span>Add storage</span>
        </button>
      </div>
    </>
  );
};

export default StoragesWidget;
