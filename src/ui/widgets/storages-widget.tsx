import { FC, useContext, useLayoutEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { StorageDto, BatchDto } from '../../application';
import CoreContext from '../core-context.ts';
import { SafeArea } from 'antd-mobile';

type StorageItemProps = {
  data: BatchDto;
};
const StorageProductWidget: FC<StorageItemProps> = (props) => {
  return (
    <div className='flex text-xs justify-between text-gray-400'>
      <div>{props.data.name}</div>
      <div>{props.data.quantity}</div>
    </div>
  );
};

type StorageCardWidgetProps = {
  data: StorageDto;
  onClick: () => void;
};

const StorageCardWidget: FC<StorageCardWidgetProps> = (props) => {
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
    <div className='border rounded-md p-3 cursor-pointer' onClick={props.onClick}>
      <div className='font-semibold'>{props.data.name}</div>
      {!products.length && <div className='text-gray-400'>Empty</div>}
      {!!products.length && (
        <div>
          {products.map((product) => (
            <StorageProductWidget key={product.id} data={product} />
          ))}
        </div>
      )}
    </div>
  );
};

type StoragesWidgetProps = {
  data?: StorageDto[];
  onClickAddStorage: () => void;
  onClickStorageCard: (storageId: StorageDto['id']) => void;
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
      <div className='absolute bottom-0 left-0  bg-gray-100 w-full'>
        <div className='h-10 flex items-center px-3'>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddStorage}>
            <FontAwesomeIcon icon={faCirclePlus} />
            <span>Add storage</span>
          </button>
        </div>
        <SafeArea position='bottom' />
      </div>
    </>
  );
};

export default StoragesWidget;
