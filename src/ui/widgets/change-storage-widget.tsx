import { FC, useContext } from 'react';
import { Formik } from 'formik';
import CoreContext from '../core-context.ts';
import { StorageDto } from '../../application';

type Props = {
  data?: StorageDto;
  onSuccess: () => void;
};

const ChangeStorageWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);

  const handleSubmitStorage = (values: { name: string }) => {
    if (props.data) {
      core.commands.storage.update({ storage: { id: props.data.id, name: values.name } }).then(props.onSuccess);
      return;
    }
    core.commands.storage.create({ name: values.name }).then(props.onSuccess);
  };

  const handleRemoveStorage = (id: string) => () => {
    core.commands.storage.remove({ id }).then(props.onSuccess);
  };

  return (
    <div>
      <h3 className='text-xl font-semibold px-3'>{props.data ? 'Edit storage' : 'Add new storage'}</h3>

      <Formik initialValues={{ name: props.data?.name || '' }} onSubmit={handleSubmitStorage}>
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit} className='px-3 flex flex-col'>
            <input
              type='text'
              name='name'
              value={values.name}
              onChange={handleChange}
              placeholder='Name'
              className='mt-5 p-4 bg-gray-100 rounded-md'
            />

            <div
              className='absolute bottom-0 left-0 bg-gray-100 w-full'
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className='h-10 flex items-center justify-between px-3'>
                {props.data ? (
                  <button
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

export default ChangeStorageWidget;
