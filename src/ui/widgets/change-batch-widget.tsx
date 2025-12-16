import { FC, useContext } from 'react';
import CoreContext from '../core-context.ts';
import { Formik } from 'formik';
import cn from 'classnames';
import { Storage, Batch } from '../../domain';
import { SafeArea } from 'antd-mobile';

type Props = {
  data?: Batch;
  storage: Storage;
  onSuccess: () => void;
};

interface FormValues {
  name: string;
  quantity: number | '';
  expirationDate: string | '';
}

const ChangeBatchWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const batchManager = core.getBatchManager();

  const handleRemove = (id: Batch['id']) => () => {
    batchManager.removeBatch(id).then(props.onSuccess);
  };

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data ? 'Edit product' : 'New product'}</h3>

      <Formik<FormValues>
        initialValues={{
          name: props.data?.name || '',
          quantity: props.data?.quantity || '',
          expirationDate: '',
        }}
        onSubmit={(values) => {
          if (!props.data) {
            batchManager
              .createBatch({
                storageId: props.storage.id,
                name: values.name,
                quantity: Number(values.quantity || 0),
                expirationDate: values.expirationDate ? new Date(values.expirationDate) : null,
              })
              .then(props.onSuccess);
            return;
          }
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit} className='px-3 flex flex-col'>
            <div className='mt-5 w-full'>
              <label className='text-sm font-medium text-gray-700' htmlFor='name'>
                Name
              </label>
              <input
                type='text'
                name='name'
                value={values.name}
                onChange={handleChange}
                placeholder='Name'
                className={cn('p-4 rounded-md w-full', { 'bg-gray-100': !props.data })}
                disabled={!!props.data}
              />
            </div>
            {!props.data && (
              <div className='mt-5 w-full'>
                <label className='text-sm font-medium text-gray-700' htmlFor='quantity'>
                  Quantity
                </label>
                <input
                  type='number'
                  name='quantity'
                  value={values.quantity}
                  onChange={handleChange}
                  placeholder='Quantity'
                  className='p-4 bg-gray-100 rounded-md w-full'
                />
              </div>
            )}
            {!props.data && (
              <div className='mt-5 w-full'>
                <label className='text-sm font-medium text-gray-700' htmlFor='expirationDate'>
                  Expiration date
                </label>
                <input
                  type='date'
                  name='expirationDate'
                  value={values.expirationDate}
                  onChange={handleChange}
                  placeholder='Expiration date'
                  className='p-4 bg-gray-100 rounded-md appearance-none w-full'
                />
              </div>
            )}
            <div className='absolute bottom-0 left-0 bg-gray-100 w-full'>
              <div className='h-10 flex items-center justify-between px-3'>
                {props.data ? (
                  <button
                    type='button'
                    className='flex items-center gap-1 text-red-600 font-normal'
                    onClick={handleRemove(props.data.id)}
                  >
                    <span>Remove</span>
                  </button>
                ) : (
                  <div />
                )}
                {!props.data ? (
                  <button type='submit' className='flex items-center gap-1 text-blue-600 font-medium'>
                    <span>Submit</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>
              <SafeArea position='bottom' />
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ChangeBatchWidget;
