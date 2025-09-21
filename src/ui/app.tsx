import { FC, useContext, useEffect, useState } from 'react';
import StoragesWidget from './widgets/storages-widget.tsx';
import LayoutWidget from './widgets/layout-widget.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import ChangeStorageWidget from './widgets/change-storage-widget.tsx';
import StorageWidget from './widgets/storage-widget.tsx';
import CoreContext from './core-context.ts';
import ChangeBatchWidget from './widgets/change-batch-widget.tsx';
import BatchWidget from './widgets/batch-widget.tsx';
import { BatchDto } from '../application';
import LoginUserWidget from './widgets/user/login-user-widget.tsx';
import RegisterUserWidget from './widgets/user/register-user-widget.tsx';

const App: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storageId = searchParams.get('storageId');
  const batchId = searchParams.get('batchId');
  const mode = searchParams.get('mode');

  const core = useContext(CoreContext);
  const storageManager = core.getStorageManager();
  const [storageManagerState, setStorageManagerState] = useState(storageManager.getState());
  const [activeStorageBatches] = useState<BatchDto[]>([]);

  useEffect(() => {
    storageManager.subscribe(setStorageManagerState);
    storageManager.loadStorages();

    return () => {
      storageManager.unsubscribe(setStorageManagerState);
    };
  }, [storageManager]);

  const storages = storageManagerState.storages;
  const activeStorage = storages.find((storage) => storage.id === storageId);
  const activeStorageBatch = activeStorageBatches?.find((batch) => batch.id === batchId);

  if (activeStorage && mode === 'new') {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('mode');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeBatchWidget
          storage={activeStorage}
          onSuccess={() => {
            searchParams.delete('mode');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (mode === 'new') {
    return (
      <LayoutWidget
        backText='Storages'
        onBack={() => {
          searchParams.delete('mode');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeStorageWidget
          onSuccess={() => {
            searchParams.delete('mode');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (mode === 'login') {
    return (
      <LayoutWidget
        backText='Storages'
        onBack={() => {
          searchParams.delete('mode');
          navigate({ search: searchParams.toString() });
        }}
        actionText='Register'
        onAction={() => {
          searchParams.set('mode', 'register');
          navigate({ search: searchParams.toString() });
        }}
      >
        <LoginUserWidget
          onSuccess={() => {
            searchParams.delete('mode');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (mode === 'register') {
    return (
      <LayoutWidget
        backText='Login'
        onBack={() => {
          searchParams.set('mode', 'login');
          navigate({ search: searchParams.toString() });
        }}
      >
        <RegisterUserWidget
          onSuccess={() => {
            searchParams.set('mode', 'login');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage && activeStorageBatch && mode === 'edit') {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('batchId');
          searchParams.delete('mode');
          navigate({ search: searchParams.toString() });
        }}
      >
        <ChangeBatchWidget
          data={activeStorageBatch}
          storage={activeStorage}
          onSuccess={() => {
            searchParams.delete('batchId');
            searchParams.delete('mode');
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
    );
  }

  if (activeStorage && activeStorageBatch) {
    return (
      <LayoutWidget
        backText={activeStorage.name}
        onBack={() => {
          searchParams.delete('batchId');
          navigate({ search: searchParams.toString() });
        }}
      >
        <BatchWidget
          batch={activeStorageBatch}
          onSuccess={() => {
            searchParams.delete('batchId');
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
      >
        <StorageWidget
          data={activeStorage}
          onClickAddProduct={() => {
            searchParams.set('mode', 'new');
            navigate({ search: searchParams.toString() });
          }}
          onClickShowProduct={(batchId) => {
            searchParams.set('batchId', batchId);
            navigate({ search: searchParams.toString() });
          }}
          onClickEditProduct={(batchId) => {
            searchParams.set('batchId', batchId);
            searchParams.set('mode', 'edit');
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
    <LayoutWidget
      actionText={'Add new'}
      onAction={() => {
        searchParams.set('mode', 'new');
        navigate({ search: searchParams.toString() });
      }}
    >
      <StoragesWidget
        data={storages}
        onClickStorageCard={(storageId) => {
          searchParams.set('storageId', storageId);
          navigate({ search: searchParams.toString() });
        }}
      />
    </LayoutWidget>
  );
};

export default App;
