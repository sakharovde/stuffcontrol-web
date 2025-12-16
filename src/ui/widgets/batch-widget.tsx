import { FC, useContext } from 'react';
import { Formik } from 'formik';
import CoreContext from '../core-context.ts';
import { SafeArea } from 'antd-mobile';
import { Batch } from '../../domain';

type Props = {
  batch: Batch;
  onSuccess: () => void;
};

const BatchWidget: FC<Props> = (props) => {
  const batch = props.batch;
  const core = useContext(CoreContext);
  const batchManager = core.getBatchManager();

  const handleSubmit = (values: { quantity: number }) => {
    batch.quantity = values.quantity;
    batchManager.updateBatch(batch).then(props.onSuccess);
  };

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{batch.name}</h3>
      <div className='px-3 py-5 flex flex-col gap-1'>
        <div className='flex justify-between'>
          <span>Quantity</span>
          <span>{batch.quantity}</span>
        </div>
        {batch.expirationDate && (
          <div className='flex justify-between'>
            <span>Expiration date</span>
            <span>{batch.expirationDate.toISOString().split('T')[0]}</span>
          </div>
        )}
      </div>
      <Formik
        initialValues={{ quantity: batch.quantity }}
        validate={(values) => {
          const errors: { quantity?: string } = {};
          if (values.quantity < 0) {
            errors.quantity = 'Quantity should be positive';
          }
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit} className='px-3 flex absolute left-0 bottom-0 w-full'>
            <div className='w-full flex'>
              <div className='basis-1/6 flex-grow-0 flex-shrink-0 p-1'>
                <button
                  type='button'
                  className='w-full p-1 text-center border border-gray-300 rounded'
                  onClick={() => setFieldValue('quantity', values.quantity - 1)}
                  disabled={values.quantity <= 0}
                >
                  -
                </button>
              </div>
              <div className='basis-1/6 flex-grow-0 flex-shrink-0 p-1'>
                <input
                  type='number'
                  name='quantity'
                  value={values.quantity}
                  onChange={handleChange}
                  className='w-full p-1 text-center border border-gray-300 rounded'
                />
              </div>
              <div className='basis-1/6 flex-grow-0 flex-shrink-0 p-1'>
                <button
                  type='button'
                  className='w-full p-1 text-center border border-gray-300 rounded'
                  onClick={() => setFieldValue('quantity', values.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className='basis-1/2 flex-grow-0 flex-shrink-0 p-1'>
                <button type='submit' className='w-full p-1 text-center border border-gray-300 rounded'>
                  <span>Submit</span>
                </button>
              </div>
            </div>
            <SafeArea position='bottom' />
          </form>
        )}
      </Formik>
    </div>
  );
};

export default BatchWidget;
