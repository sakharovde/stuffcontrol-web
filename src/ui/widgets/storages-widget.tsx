import { FC, useContext } from 'react';
import CoreContext from '../core-context.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import { Storage } from '../storage.tsx';

const StoragesWidget: FC = () => {
  const core = useContext(CoreContext);

  const queryClient = useQueryClient();
  const storagesQuery = useQuery({ queryKey: ['storages'], queryFn: core.useCases.storage.getAll.execute });
  const createStorageMutation = useMutation({
    mutationFn: core.useCases.storage.create.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
    },
  });
  const removeStorageMutation = useMutation({
    mutationFn: core.useCases.storage.remove.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
    },
  });

  const handleSubmitStorage = (values: { name: string }) => {
    createStorageMutation.mutate(values.name);
  };

  const handleRemoveStorage = (id: string) => () => {
    removeStorageMutation.mutate(id);
  };

  return (
    <div>
      <h3 className='text-xl font-semibold'>Add new storage</h3>
      <div>
        <Formik initialValues={{ name: '' }} onSubmit={handleSubmitStorage}>
          {({ values, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <input type='text' name='name' value={values.name} onChange={handleChange} placeholder='Name' />
              <button type='submit'>Add</button>
            </form>
          )}
        </Formik>
      </div>
      <h3 className='text-xl font-semibold'>Storages</h3>
      <div className='flex gap-5 flex-col'>
        {storagesQuery.data?.map((storage) => (
          <Storage key={storage.id} data={storage} onRemove={handleRemoveStorage(storage.id)} />
        ))}
      </div>
    </div>
  );
};

export default StoragesWidget;
