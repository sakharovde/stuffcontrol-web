import { FC, useContext } from 'react';
import StorageModel from '../core/domain/models/storage.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CoreContext from './core-context.ts';
import StorageItem from './storage-item.tsx';
import { Formik } from 'formik';

type Props = {
  data: StorageModel;
  onRemove: () => void;
};

export const Storage: FC<Props> = (props) => {
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
    <div className='border'>
      <div className='flex justify-between'>
        <div>{props.data.name}</div>
        <div className='cursor-pointer text-red-400' onClick={props.onRemove}>
          remove
        </div>
      </div>
      <div className='text-gray-400'>Items</div>
      <div>
        {itemsQuery.data?.map((item) => (
          <StorageItem
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
              quantityChange: values.quantity,
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
    </div>
  );
};
