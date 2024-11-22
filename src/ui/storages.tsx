import { FC } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import Core from '../core/core.ts';

const core = new Core();

const Storages: FC = () => {
  const queryClient = useQueryClient();
  const storagesQuery = useQuery({ queryKey: ['storages'], queryFn: core.useCases.storage.getAll.execute });
  const createStorageMutation = useMutation({
    mutationFn: core.useCases.storage.create.execute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
    },
  });

  const handleSubmitStorage = async (values: { name: string }) => {
    createStorageMutation.mutate(values.name);
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
          <div key={storage.id} className='border'>
            {storage.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storages;
