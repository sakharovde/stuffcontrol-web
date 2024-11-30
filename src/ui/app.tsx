import { FC, useContext, useLayoutEffect, useState } from 'react';
import StoragesWidget from './widgets/storages-widget.tsx';
import LayoutWidget from './widgets/layout-widget.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import ChangeStorageWidget from './widgets/change-storage-widget.tsx';
import StorageWidget from './widgets/storage-widget.tsx';
import CoreContext from './core-context.ts';
import ChangeStorageProductWidget from './widgets/change-storage-product-widget.tsx';
import StorageWithProductsDto from '../application/dto/storage-with-products-dto.ts';

const App: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storageId = searchParams.get('storageId');
  const productId = searchParams.get('productId');
  const mode = searchParams.get('mode');

  const core = useContext(CoreContext);
  const [storages, setStorages] = useState<StorageWithProductsDto[]>([]);

  useLayoutEffect(() => {
    const updateStoragesState = () => {
      core.queries.storage.getAllWithProducts().then((data) => {
        setStorages(data);
      });
    };

    core.eventEmitters.storage.on('storageCreated', updateStoragesState);
    core.eventEmitters.storage.on('storageUpdated', updateStoragesState);
    core.eventEmitters.storage.on('storageDeleted', updateStoragesState);

    updateStoragesState();

    return () => {
      core.eventEmitters.storage.off('storageCreated', updateStoragesState);
      core.eventEmitters.storage.off('storageUpdated', updateStoragesState);
      core.eventEmitters.storage.off('storageDeleted', updateStoragesState);
    };
  }, [core]);

  const activeStorage = storages.find((storage) => storage.id === storageId);
  const activeStorageProduct = activeStorage?.products.find((product) => product.id === productId);

  if (storageId === 'new') {
    return (
      <LayoutWidget
        backText='Storages'
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
        backText='Storages'
        onBack={() => {
          searchParams.delete('storageId');
          navigate({ search: searchParams.toString() });
        }}
        actionText='Save'
        onAction={() => {
          core.commands.storage.saveProductsChanges(activeStorage.id).then(() => {
            searchParams.delete('storageId');
            navigate({ search: searchParams.toString() });
          });
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
        data={storages}
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
