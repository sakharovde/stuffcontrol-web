import { FC, useContext } from 'react';
import Storage from '../../core/domain/models/storage.ts';
import CoreContext from '../core-context.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import StorageItem from '../../core/domain/models/storage-item.ts';

type StorageItemWidgetProps = {
  data: StorageItem;
  onChangeQuantity: (quantityChange: number) => void;
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

type Props = {
  data: Storage;
  onClickEditStorage: () => void;
  onClickAddProduct: () => void;
};

const StorageWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);

  const queryKey = ['storage-items', props.data.id];
  const itemsQuery = useQuery({ queryKey, queryFn: () => core.useCases.storage.getItems.execute(props.data.id) });

  const queryClient = useQueryClient();
  const addNewItemMutation = useMutation({
    mutationFn: core.useCases.storage.addNewProduct.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const changeQuantityMutation = useMutation({
    mutationFn: core.useCases.storage.changeProductQuantity.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data.name}</h3>

      <div className='text-gray-400'>Items</div>
      <div>
        {itemsQuery.data?.map((item) => (
          <StorageItemWidget
            key={item.id}
            data={item}
            onChangeQuantity={(quantityChange) => {
              changeQuantityMutation.mutate({
                storageId: props.data.id,
                productId: item.productId,
                quantityChange,
              });
            }}
          />
        ))}
      </div>
      <div>
        <Formik
          initialValues={{ name: '', quantity: 0 }}
          onSubmit={(values) => {
            addNewItemMutation.mutate({
              storageId: props.data.id,
              productName: values.name,
              quantity: values.quantity,
            });
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <input type='text' name='name' value={values.name} onChange={handleChange} placeholder='Name' />
              <input
                type='number'
                name='quantity'
                value={values.quantity}
                onChange={handleChange}
                placeholder='Quantity'
              />
              <button type='submit'>Add</button>
            </form>
          )}
        </Formik>
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
