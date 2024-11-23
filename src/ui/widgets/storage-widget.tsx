import { FC } from 'react';
import cn from 'classnames';
import StorageWithProductsDto from '../../core/modules/storage/application/dto/storage-with-products-dto.ts';
import StorageProductDto from '../../core/modules/storage/application/dto/storage-product-dto.ts';

type StorageItemWidgetProps = {
  data: StorageProductDto;
};

const StorageProductWidget: FC<StorageItemWidgetProps> = (props) => {
  return (
    <div className='flex justify-between'>
      <div>{props.data.name}</div>
      <div>{props.data.quantity}</div>
    </div>
  );
};

type Props = {
  data: StorageWithProductsDto;
  onClickEditStorage: () => void;
  onClickAddProduct: () => void;
  onClickEditProduct: (storageProductId: StorageProductDto['id']) => void;
};

const StorageWidget: FC<Props> = (props) => {
  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div>
        {props.data.products.map((product, index) => (
          <div
            key={product.id}
            className={cn('px-3', 'cursor-pointer')}
            onClick={() => props.onClickEditProduct(product.id)}
          >
            <div className={cn('py-5', { 'border-t': !!index })}>
              <StorageProductWidget data={product} />
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
