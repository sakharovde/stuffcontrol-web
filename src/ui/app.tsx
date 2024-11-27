import { FC, useContext } from 'react';
import StoragesWidget from './widgets/storages-widget.tsx';
import LayoutWidget from './widgets/layout-widget.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import ChangeStorageWidget from './widgets/change-storage-widget.tsx';
import StorageWidget from './widgets/storage-widget.tsx';
import CoreContext from './core-context.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ChangeStorageProductWidget from './widgets/change-storage-product-widget.tsx';

const App: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storageId = searchParams.get('storageId');
  const productId = searchParams.get('productId');
  const mode = searchParams.get('mode');

  const core = useContext(CoreContext);
  const queryClient = useQueryClient();

  const storagesQuery = useQuery({ queryKey: ['storages'], queryFn: core.queries.storage.getAllWithProducts.execute });
  const activeStorage = storagesQuery.data?.find((storage) => storage.id === storageId);
  const activeStorageProduct = activeStorage?.products.find((product) => product.id === productId);

  const saveStorageProductsMutation = useMutation({
    mutationFn: core.commands.storage.saveProductsChanges.execute,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storages'] });
      queryClient.invalidateQueries({ queryKey: ['changedProducts', variables] });
      searchParams.delete('storageId');
      navigate({ search: searchParams.toString() });
    },
  });

  if (storageId === 'new') {
    return (
      <LayoutWidget
        backText='Home'
        onBack={() => {
          searchParams.delete('storageId');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageWidget
          onSuccess={() => {
            searchParams.delete('storageId');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage && productId === 'new') {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('productId');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageProductWidget
          storage={activeStorage}
          onSuccess={() => {
            searchParams.delete('productId');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage && activeStorageProduct) {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('productId');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageProductWidget
          data={activeStorageProduct}
          storage={activeStorage}
          onSuccess={() => {
            searchParams.delete('productId');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage && mode === 'edit') {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('mode');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageWidget
          data={activeStorage}
          onSuccess={() => {
            searchParams.delete('mode');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage) {
    return (
      <LayoutWidget
        backText='Home'
        onBack={() => {
          searchParams.delete('storageId');
          navigate({ search: searchParams.toString() });
        }}
        actionText='Save'
        onAction={() => {
          saveStorageProductsMutation.mutate(activeStorage.id);
        }}
      >
        <StorageWidget
          data={activeStorage}
          onClickAddProduct={() => {
            searchParams.set('productId', 'new');
            navigate({ search: searchParams.toString() });
          }}
          onClickEditProduct={(productId) => {
            searchParams.set('productId', productId);
            navigate({ search: searchParams.toString() });
          }}
          onClickEditStorage={() => {
            searchParams.set('mode', 'edit');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  return (
    <LayoutWidget>
      <StoragesWidget
        data={storagesQuery.data}
        onClickAddStorage={() => {
          searchParams.set('storageId', 'new');
          navigate({ search: searchParams.toString() });
        }}
        onClickStorageCard={(storageId) => {
          searchParams.set('storageId', storageId);
          navigate({ search: searchParams.toString() });
        }}
      />
    </LayoutWidget>
  );
};

export default App;
