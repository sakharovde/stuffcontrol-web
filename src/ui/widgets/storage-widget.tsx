import { FC } from 'react';
import cn from 'classnames';
import StorageWithProductsDto from '../../application/dto/storage-with-products-dto.ts';
import ProductDto from '../../application/dto/product-dto.ts';

type StorageItemWidgetProps = {
  data: ProductDto;
  onClickEdit: () => void;
};

const StorageProductWidget: FC<StorageItemWidgetProps> = (props) => {
  return (
    <div className={cn('py-1', 'px-3', 'rounded-md', 'bg-gray-100', 'border', 'border-gray-50')}>
      <div className='flex justify-between gap-5'>
        <div className='flex-1 text-sm'>{props.data.name}</div>

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
            className={cn('flex', 'items-center', 'gap-1', 'text-blue-600', 'font-medium', 'text-xs')}
            onClick={props.onClickEdit}
          >
            <span>Edit</span>
          </button>
          {/*<button*/}
          {/*  className={cn('flex', 'items-center', 'gap-1', 'text-blue-600', 'font-medium', 'text-xs')}*/}
          {/*  onClick={props.onClickPlus}*/}
          {/*>*/}
          {/*  <span>Items</span>*/}
          {/*</button>*/}
        </div>
      </div>
    </div>
  );
};

type Props = {
  data: StorageWithProductsDto;
  onClickEditStorage: () => void;
  onClickAddProduct: () => void;
  onClickEditProduct: (storageProductId: ProductDto['id']) => void;
};

const StorageWidget: FC<Props> = (props) => {
  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div className='flex flex-col gap-3 mt-5 px-3'>
        {props.data.products.map((product) => {
          return (
            <StorageProductWidget
              key={product.id}
              data={product}
              onClickEdit={() => props.onClickEditProduct(product.id)}
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
