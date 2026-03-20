import { CSSProperties, FC, useCallback, useContext, useEffect, useState } from 'react';
import StoragesWidget from './widgets/storages-widget.tsx';
import LayoutWidget from './widgets/layout-widget.tsx';
import { useNavigate, useSearchParams } from 'react-router';
import ChangeStorageWidget from './widgets/change-storage-widget.tsx';
import StorageWidget from './widgets/storage-widget.tsx';
import CoreContext from './core-context.ts';
import ChangeBatchWidget from './widgets/change-batch-widget.tsx';
import BatchWidget from './widgets/batch-widget.tsx';
import LoginUserWidget from './widgets/user/login-user-widget.tsx';
import RegisterUserWidget from './widgets/user/register-user-widget.tsx';
import { FloatingBubble, Toast, Dialog } from 'antd-mobile';
import { AddOutline, LoopOutline } from 'antd-mobile-icons';
import type { PendingStorageChanges } from '../application/sync/sync-manager.ts';
import type { BatchListState } from '../application/storage/batch-manager.ts';

const App: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storageId = searchParams.get('storageId');
  const batchId = searchParams.get('batchId');
  const mode = searchParams.get('mode');

  const core = useContext(CoreContext);
  const storageManager = core.getStorageManager();
  const batchManager = core.getBatchManager();
  const syncManager = core.getSyncManager();

  const [storageManagerState, setStorageManagerState] = useState(storageManager.getState());
  const [syncingStorageId, setSyncingStorageId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingStorageChanges>>(new Map());

  useEffect(() => {
    storageManager.subscribe(setStorageManagerState);
    storageManager.loadStorages();

    return () => {
      storageManager.unsubscribe(setStorageManagerState);
    };
  }, [storageManager]);

  const storages = storageManagerState.storages;
  const activeStorage = storages.find((storage) => storage.id === storageId);
  const activeStorageBatch = batchId ? batchManager.getBatchById(batchId) : null;
  const isListView = !activeStorage;
  const activePending = activeStorage ? pendingChanges.get(activeStorage.id) : undefined;
  const hasActivePending = !!activePending?.pendingEvents;

  const refreshPendingChanges = useCallback(async () => {
    const stats = await syncManager.getPendingChanges();
    setPendingChanges(stats);
  }, [syncManager]);

  useEffect(() => {
    refreshPendingChanges();
  }, [refreshPendingChanges, storageManagerState]);

  useEffect(() => {
    const handler = (_state: BatchListState) => {
      refreshPendingChanges();
    };
    batchManager.subscribe(handler);
    return () => {
      batchManager.unsubscribe(handler);
    };
  }, [batchManager, refreshPendingChanges]);

  const handleReset = async (targetStorageId: string) => {
    const storageChanges = pendingChanges.get(targetStorageId);
    if (!storageChanges?.pendingEvents) {
      Toast.show({ content: 'Нет изменений для сброса' });
      return;
    }
    const confirmed = await Dialog.confirm({
      content: 'Сбросить все несинхронизированные изменения?',
      confirmText: 'Да',
      cancelText: 'Нет',
    });
    if (!confirmed) {
      return;
    }
    try {
      setSyncingStorageId(targetStorageId);
      await syncManager.discardPendingTransactions(targetStorageId);
      await Promise.all([
        storageManager.loadStorages(),
        batchManager.loadBatches(targetStorageId, { force: true }),
      ]);
      Toast.show({ icon: 'success', content: 'Изменения сброшены' });
      await refreshPendingChanges();
    } catch (error) {
      console.error(error);
      Toast.show({ icon: 'fail', content: 'Не удалось сбросить' });
    } finally {
      setSyncingStorageId(null);
    }
  };

  const handleSync = async (targetStorageId: string) => {
    try {
      setSyncingStorageId(targetStorageId);
      await syncManager.syncPendingTransactions(targetStorageId);
      Toast.show({ icon: 'success', content: 'Синхронизация завершена' });
      await refreshPendingChanges();
    } catch (error) {
      console.error(error);
      Toast.show({ icon: 'fail', content: 'Ошибка синхронизации' });
    } finally {
      setSyncingStorageId(null);
    }
  };

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
      <>
        <LayoutWidget
          actionText={hasActivePending ? 'Reset changes' : undefined}
          onAction={hasActivePending ? () => handleReset(activeStorage.id) : undefined}
          backText='Storages'
          onBack={() => {
            searchParams.delete('storageId');
            navigate({ search: searchParams.toString() });
          }}
        >
          <StorageWidget
            data={activeStorage}
            pendingChange={pendingChanges.get(activeStorage.id)}
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
        <div className='max-w-lg mx-auto'>
          <FloatingBubble
            axis='xy'
            magnetic='x'
            style={
              {
                '--initial-position-bottom': '80px',
                '--initial-position-right': '24px',
                backgroundColor:
                  syncingStorageId === activeStorage.id
                    ? '#2563eb'
                    : hasActivePending
                      ? '#f97316'
                      : '#d1d5db',
                color:
                  syncingStorageId === activeStorage.id || hasActivePending ? '#fff' : '#6b7280',
                pointerEvents:
                  syncingStorageId === activeStorage.id || !hasActivePending ? 'none' : 'auto',
              } as CSSProperties
            }
            onClick={hasActivePending ? () => handleSync(activeStorage.id) : undefined}
          >
            {syncingStorageId === activeStorage.id ? (
              <div className='flex items-center gap-2 text-xs px-3 py-2 text-white'>
                <LoopOutline fontSize={20} className='animate-spin' color='inherit' />
                Syncing...
              </div>
            ) : (
              <LoopOutline fontSize={22} color='inherit' />
            )}
          </FloatingBubble>
        </div>
      </>
    );
  }

  return (
    <>
      <LayoutWidget
        actionText={'Add new'}
        onAction={() => {
          searchParams.set('mode', 'new');
          navigate({ search: searchParams.toString() });
        }}
      >
        <StoragesWidget
          data={storages}
          pendingChanges={pendingChanges}
          onClickStorageCard={(storageId) => {
            searchParams.set('storageId', storageId);
            navigate({ search: searchParams.toString() });
          }}
        />
      </LayoutWidget>
      {isListView && (
        <div className='max-w-lg mx-auto'>
          <FloatingBubble
            axis='xy'
            magnetic='x'
            style={{ '--initial-position-bottom': '80px', '--initial-position-right': '24px' } as CSSProperties}
            onClick={() => {
              searchParams.set('mode', 'new');
              navigate({ search: searchParams.toString() });
            }}
          >
            <AddOutline fontSize={22} />
          </FloatingBubble>
        </div>
      )}
    </>
  );
};

export default App;
