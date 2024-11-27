import { FC, useContext } from 'react';
import CoreContext from '../core-context.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import Storage from '../../core/domain/models/storage.ts';
import cn from 'classnames';
import StorageProductDto from '../../core/application/dto/storage-product-dto.ts';

type Props = {
  data?: StorageProductDto;
  storage: Storage;
  onSuccess: () => void;
};

const ChangeStorageProductWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const queryClient = useQueryClient();

  const addNewItemMutation = useMutation({
    mutationFn: core.commands.storage.addNewProduct.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      props.onSuccess();
    },
  });

  const changeProductQuantityMutation = useMutation({
    mutationFn: core.commands.storage.changeProductQuantity.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      props.onSuccess();
    },
  });

  const removeStorageProductMutation = useMutation({
    mutationFn: core.commands.storage.removeProduct.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      props.onSuccess();
    },
  });

  const handleRemoveStorage = (id: string) => () => {
    removeStorageProductMutation.mutate({ storageId: props.storage.id, productId: id });
  };

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data ? 'Edit product' : 'New product'}</h3>

      <Formik
        initialValues={{ name: props.data?.name || '', quantity: props.data?.quantity || '' }}
        onSubmit={(values) => {
          if (!props.data) {
            addNewItemMutation.mutate({
              storageId: props.storage.id,
              productName: values.name,
              quantity: Number(values.quantity || 0),
            });
            return;
          }
          changeProductQuantityMutation.mutate({
            storageId: props.data.storageId,
            productId: props.data.id,
            quantity: Number(values.quantity || 0),
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
              value={values.quantity || ''}
              onChange={handleChange}
              placeholder='Quantity'
              className='mt-5 p-4 text-center bg-gray-100 rounded-md'
            />

            <div
              className='absolute bottom-0 left-0 bg-gray-100 w-full'
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className='h-10 flex items-center justify-between px-3'>
                {props.data ? (
                  <button
                    type='button'
                    className='flex items-center gap-1 text-red-600 font-normal'
                    onClick={handleRemoveStorage(props.data.id)}
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
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ChangeStorageProductWidget;
