import { FC, useContext } from 'react';
import StorageItem from '../../core/modules/storage/domain/models/storage-item.ts';
import CoreContext from '../core-context.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import Storage from '../../core/modules/storage/domain/models/storage.ts';
import cn from 'classnames';

type Props = {
  data?: StorageItem;
  storage: Storage;
  onSuccess: () => void;
};

const ChangeStorageItemWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);

  const productQuery = useQuery({
    queryKey: ['products', props.data?.productId],
    queryFn: () => (props.data ? core.useCases.product.get.execute(props.data.productId) : null),
    enabled: !!props.data?.productId,
  });

  const queryClient = useQueryClient();
  const queryKey = ['storage-items', props.data?.id];

  const addNewItemMutation = useMutation({
    mutationFn: core.useCases.storage.addNewProduct.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      props.onSuccess();
    },
  });

  const changeProductQuantityMutation = useMutation({
    mutationFn: core.useCases.storage.changeProductQuantity.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      props.onSuccess();
    },
  });

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data ? 'Edit product' : 'New product'}</h3>

      <Formik
        initialValues={{ name: productQuery.data?.name || '', quantity: props.data?.quantity || 0 }}
        onSubmit={(values) => {
          if (!props.data) {
            addNewItemMutation.mutate({
              storageId: props.storage.id,
              productName: values.name,
              quantity: values.quantity,
            });
            return;
          }
          changeProductQuantityMutation.mutate({
            storageId: props.data.storageId,
            productId: props.data.productId,
            quantity: values.quantity,
          });
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit} className='px-3 flex flex-col'>
            <input
              type='text'
              name='name'
              value={values.name}
              onChange={handleChange}
              placeholder='Name'
              className={cn('mt-5 p-4 text-center rounded-md', { 'bg-gray-100': !props.data })}
              disabled={!!props.data}
            />
            <input
              type='number'
              name='quantity'
              value={values.quantity}
              onChange={handleChange}
              placeholder='Quantity'
              className='mt-5 p-4 text-center bg-gray-100 rounded-md'
            />

            <div className='absolute bottom-0 left-0 h-10 bg-gray-100 w-full flex items-center justify-between px-3'>
              {!!props.data ? (
                <button
                  className='flex items-center gap-1 text-red-600 font-normal'
                  onClick={() => console.log(props.data?.id)}
                >
                  <span>Remove</span>
                </button>
              ) : (
                <div />
              )}
              <button type='submit' className='flex items-center gap-1 text-blue-600 font-medium'>
                <span>Submit</span>
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ChangeStorageItemWidget;
