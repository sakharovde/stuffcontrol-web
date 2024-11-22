import { FC, useContext } from 'react';
import StoragesWidget from './widgets/storages-widget.tsx';
import LayoutWidget from './widgets/layout-widget.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import ChangeStorageWidget from './widgets/change-storage-widget.tsx';
import StorageWidget from './widgets/storage-widget.tsx';
import CoreContext from './core-context.ts';
import { useQuery } from '@tanstack/react-query';
import ChangeStorageItemWidget from './widgets/change-storage-item-widget.tsx';

const App: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storageId = searchParams.get('storageId');
  const storageItemId = searchParams.get('storageItemId');
  const mode = searchParams.get('mode');

  const core = useContext(CoreContext);
  const storagesQuery = useQuery({ queryKey: ['storages'], queryFn: core.useCases.storage.getAll.execute });
  const activeStorage = storagesQuery.data?.find((storage) => storage.id === storageId);

  const storageItemsQuery = useQuery({
    queryKey: ['storage-items', activeStorage?.id],
    queryFn: core.useCases.storage.getItems.execute,
  });
  const activeStorageItem = storageItemsQuery.data?.find((item) => item.id === storageItemId);

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

  if (activeStorage && storageItemId === 'new') {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('storageItemId');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageItemWidget
          storage={activeStorage}
          onSuccess={() => {
            searchParams.delete('storageItemId');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage && activeStorageItem) {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('storageItemId');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageItemWidget
          data={activeStorageItem}
          storage={activeStorage}
          onSuccess={() => {
            searchParams.delete('storageItemId');
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
      >
        <StorageWidget
          data={activeStorage}
          onClickAddProduct={() => {
            searchParams.set('storageItemId', 'new');
            navigate({ search: searchParams.toString() });
          }}
          onClickEditProduct={(storageItemId) => {
            searchParams.set('storageItemId', storageItemId);
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
