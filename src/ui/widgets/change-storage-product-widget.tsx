import { FC, useContext } from 'react';
import CoreContext from '../core-context.ts';
import { Formik } from 'formik';
import cn from 'classnames';
import { StorageDto, ProductDto } from '../../application';

type Props = {
  data?: ProductDto;
  storage: StorageDto;
  onSuccess: () => void;
};

interface FormValues {
  name: string;
  quantity: number | undefined;
  expirationDate: string | undefined;
}

const ChangeStorageProductWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);

  const handleRemoveStorage = (id: ProductDto['id']) => () => {
    core.commands.storage.removeProduct({ productId: id }).then(props.onSuccess);
  };

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data ? 'Edit product' : 'New product'}</h3>

      <Formik<FormValues>
        initialValues={{
          name: props.data?.name || '',
          quantity: props.data?.quantity,
          expirationDate: new Date().toISOString().split('T')[0],
        }}
        onSubmit={(values) => {
          if (!props.data) {
            core.commands.storage
              .addNewProduct({
                storageId: props.storage.id,
                productName: values.name,
                quantity: Number(values.quantity || 0),
                expirationDate: values.expirationDate ? new Date(values.expirationDate) : undefined,
              })
              .then(props.onSuccess);
            return;
          }
          core.commands.storage
            .changeProductQuantity({
              productId: props.data.id,
              quantity: Number(values.quantity || 0),
              expirationDate: values.expirationDate ? new Date(values.expirationDate) : undefined,
            })
            .then(props.onSuccess);
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
              className={cn('mt-5 p-4 rounded-md', { 'bg-gray-100': !props.data })}
              disabled={!!props.data}
            />
            <input
              type='number'
              name='quantity'
              value={values.quantity}
              onChange={handleChange}
              placeholder='Quantity'
              className='mt-5 p-4 bg-gray-100 rounded-md'
            />
            <input
              type='date'
              name='expirationDate'
              value={values.expirationDate}
              onChange={handleChange}
              placeholder='Expiration date'
              className='mt-5 p-4 bg-gray-100 rounded-md appearance-none'
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
