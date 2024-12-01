import { FC, useContext, useLayoutEffect, useState } from 'react';
import { ProductDto } from '../../application';
import CoreContext from '../core-context.ts';
import { ProductItem } from '../../domain';

type Props = {
  productId: ProductDto['id'];
};

const ProductWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const [items, setItems] = useState<ProductItem[]>([]);

  useLayoutEffect(() => {
    core.queries.productItem.getByProduct({ productId: props.productId }).then(setItems);
  }, [core]);

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>Items</h3>
      <div className='px-3 py-5 flex flex-col gap-1'>
        {items.map((item) => (
          <div key={item.id} className='py-1 px-3 rounded-md bg-gray-100 border border-gray-50'>
            <div className='text-xs'>{`Added: ${item.addedAt ? item.addedAt.toISOString().split('T')[0] : '-'}`}</div>
            <div className='text-xs'>{`Expiring: ${item.expiredAt ? item.expiredAt.toISOString().split('T')[0] : '-'}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductWidget;
