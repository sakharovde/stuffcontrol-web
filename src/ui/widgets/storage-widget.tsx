import { FC, useContext } from 'react';
import cn from 'classnames';
import StorageWithProductsDto from '../../application/dto/storage-with-products-dto.ts';
import ProductDto from '../../application/dto/product-dto.ts';
import CoreContext from '../core-context.ts';

type StorageItemWidgetProps = {
  data: ProductDto;
  onClick: () => void;
  onClickPlus: () => void;
  onClickMinus: () => void;
};

const StorageProductWidget: FC<StorageItemWidgetProps> = (props) => {
  return (
    <div className={cn('py-1', 'pl-3', 'pr-1', 'rounded-md', 'bg-gray-100', 'border', 'border-gray-50')}>
      <div className='flex justify-between gap-5'>
        <div className='cursor-pointer flex-1' onClick={props.onClick}>
          {props.data.name}
        </div>

        <div className='flex flex-col gap-1'>
          <div className='flex gap-2'>
            <div
              className={cn(
                'font-semibold',
                'text-lg',
                'w-10',
                'flex',
                'items-center',
                'justify-center',
                'text-gray-500'
              )}
            >
              {props.data.quantity}
            </div>
          </div>
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
  const core = useContext(CoreContext);

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div className='flex flex-col gap-3 mt-5 px-3'>
        {props.data.products.map((product) => {
          return (
            <StorageProductWidget
              key={product.id}
              data={product}
              onClick={() => props.onClickEditProduct(product.id)}
              onClickPlus={() =>
                core.commands.storage.changeProductQuantity({
                  productId: product.id,
                  quantity: product.quantity + 1,
                })
              }
              onClickMinus={() =>
                core.commands.storage.changeProductQuantity({
                  productId: product.id,
                  quantity: product.quantity - 1,
                })
              }
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
            <span>Add product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageWidget;
