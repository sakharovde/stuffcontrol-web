import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import Storage from '../../core/domain/models/storage.ts';
import StorageWithProductsDto from '../../core/application/dto/storage-with-products-dto.ts';
import StorageProductDto from '../../core/application/dto/storage-product-dto.ts';

type StorageItemProps = {
  data: StorageProductDto;
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
  data: StorageWithProductsDto;
  onClick: () => void;
};

const StorageCardWidget: FC<StorageCardWidgetProps> = (props) => {
  return (
    <div className='border rounded-md p-3 cursor-pointer' onClick={props.onClick}>
      <div className='font-semibold'>{props.data.name}</div>
      {!props.data.products.length && <div className='text-gray-400'>Empty</div>}
      {!!props.data.products.length && (
        <div>
          {props.data.products.map((product) => (
            <StorageProductWidget key={product.id} data={product} />
          ))}
        </div>
      )}
    </div>
  );
};

type StoragesWidgetProps = {
  data?: StorageWithProductsDto[];
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
      <div
        className='absolute bottom-0 left-0  bg-gray-100 w-full'
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className='h-10 flex items-center px-3'>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddStorage}>
            <FontAwesomeIcon icon={faCirclePlus} />
            <span>Add storage</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default StoragesWidget;
