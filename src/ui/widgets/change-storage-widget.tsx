import { FC, useContext } from 'react';
import { Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CoreContext from '../core-context.ts';
import Storage from '../../core/modules/storage/domain/models/storage.ts';

type Props = {
  data?: Storage;
  onSuccess: () => void;
};

const ChangeStorageWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const queryClient = useQueryClient();

  const createStorageMutation = useMutation({
    mutationFn: core.useCases.storage.create.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      props.onSuccess();
    },
  });
  const updateStorageMutation = useMutation({
    mutationFn: core.useCases.storage.update.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      props.onSuccess();
    },
  });

  const handleSubmitStorage = (values: { name: string }) => {
    if (props.data) {
      updateStorageMutation.mutate({ id: props.data.id, name: values.name });
      return;
    }
    createStorageMutation.mutate(values.name);
  };

  const removeStorageMutation = useMutation({
    mutationFn: core.useCases.storage.remove.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      props.onSuccess();
    },
  });

  const handleRemoveStorage = (id: string) => () => {
    removeStorageMutation.mutate(id);
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
              className='mt-5 p-4 text-center bg-gray-100 rounded-md'
            />

            <div className='absolute bottom-0 left-0 h-10 bg-gray-100 w-full flex items-center justify-between px-3'>
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
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ChangeStorageWidget;
