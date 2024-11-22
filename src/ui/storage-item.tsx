import { FC, useContext } from 'react';
import StorageItemModel from '../core/domain/models/storage-item.ts';
import { useQuery } from '@tanstack/react-query';
import CoreContext from './core-context.ts';

type Props = {
  data: StorageItemModel;
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

  return (
    <div className='flex justify-between'>
      <div>{productQuery.data.name}</div>
      <div>{props.data.quantity}</div>
    </div>
  );
};

export default StorageItem;
