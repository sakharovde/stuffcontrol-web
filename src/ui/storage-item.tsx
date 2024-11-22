import { FC, useContext } from 'react';
import StorageItemModel from '../core/domain/models/storage-item.ts';
import { useQuery } from '@tanstack/react-query';
import CoreContext from './core-context.ts';

type Props = {
  data: StorageItemModel;
  onChangeQuantity: (quantityChange: number) => void;
};

const StorageItem: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const productQuery = useQuery({
    queryKey: ['products', props.data.productId],
    queryFn: () => core.useCases.product.get.execute(props.data.productId),
  });

  if (!productQuery.data) {
    return null;
  }

  const increment = () => {
    props.onChangeQuantity(1);
  };

  const decrement = () => {
    props.onChangeQuantity(-1);
  };

  return (
    <div className='flex justify-between'>
      <div>{productQuery.data.name}</div>
      <div className='flex gap-3'>
        <button onClick={decrement}>-</button>
        <div>{props.data.quantity}</div>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
};

export default StorageItem;
