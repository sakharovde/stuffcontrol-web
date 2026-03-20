import { FC, ReactNode } from 'react';
import { Card, Empty, Grid, SafeArea, Tag } from 'antd-mobile';
import { RightOutline, CompassOutline, ShopbagOutline } from 'antd-mobile-icons';
import { Storage } from '../../domain';
import type { PendingStorageChanges } from '../../application/sync/sync-manager.ts';

type StorageCardWidgetProps = {
  data: Storage;
  pendingChange?: PendingStorageChanges;
  onClick: () => void;
};

const ACCENT_COLORS = ['#1677ff', '#13c2c2', '#eb2f96', '#fa8c16', '#52c41a', '#722ed1'];

const pickAccentColor = (seed: string) => {
  let hash = 0;
  for (const char of seed) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }
  const index = Math.abs(hash) % ACCENT_COLORS.length;
  return ACCENT_COLORS[index];
};

const buildInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return 'SC';
  }
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
};

const formatId = (id: string) => {
  if (id.length <= 8) {
    return id;
  }
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
};

const QuickActionChip: FC<{ icon: ReactNode; text: string }> = ({ icon, text }) => (
  <div className='flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100'>
    {icon}
    <span className='truncate'>{text}</span>
  </div>
);

const StorageCardWidget: FC<StorageCardWidgetProps> = ({ data, pendingChange, onClick }) => {
  const accent = pickAccentColor(data.id);
  const hasPendingChanges = !!pendingChange?.pendingEvents;
  const totalDelta = pendingChange?.totalDelta ?? 0;
  return (
    <Card
      className={`mb-4 shadow-sm storage-card cursor-pointer ${
        hasPendingChanges ? 'border border-orange-200 bg-orange-50/40' : ''
      }`}
      onClick={onClick}
    >
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div
            className='w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg'
            style={{ background: accent }}
          >
            {buildInitials(data.name)}
          </div>
          <div>
            <div className='text-base font-semibold'>{data.name}</div>
            <div className='text-xs text-gray-500'>{`ID • ${formatId(data.id)}`}</div>
          </div>
        </div>
        {hasPendingChanges ? (
          <Tag color='warning' fill='solid'>
            Pending sync
          </Tag>
        ) : (
          <Tag color='primary' fill='solid'>
            Synced
          </Tag>
        )}
      </div>
      <Grid columns={2} gap={8} className='mt-4'>
        <Grid.Item>
          <QuickActionChip icon={<ShopbagOutline />} text='Tap to open inventory' />
        </Grid.Item>
        <Grid.Item>
          <QuickActionChip icon={<CompassOutline />} text='Manage batches & sync' />
        </Grid.Item>
      </Grid>
      <div className='mt-4 flex items-center justify-between text-xs text-gray-500'>
        <span>
          {hasPendingChanges
            ? `Unsynced changes${totalDelta ? ` • ${totalDelta > 0 ? '+' : ''}${totalDelta} items` : ''}`
            : 'Updated recently'}
        </span>
        <RightOutline />
      </div>
    </Card>
  );
};

type StoragesWidgetProps = {
  data?: Storage[];
  pendingChanges?: Map<string, PendingStorageChanges>;
  onClickStorageCard: (storageId: Storage['id']) => void;
};

const StoragesWidget: FC<StoragesWidgetProps> = ({ data = [], pendingChanges, onClickStorageCard }) => {
  const hasStorages = data.length > 0;

  return (
    <div className='pb-12'>
      <h3 className='text-2xl font-semibold mb-4 px-1'>{'Storages'}</h3>
      {hasStorages ? (
        data.map((storage) => (
          <StorageCardWidget
            key={storage.id}
            data={storage}
            pendingChange={pendingChanges?.get(storage.id)}
            onClick={() => onClickStorageCard(storage.id)}
          />
        ))
      ) : (
        <div className='py-12'>
          <Empty description='No storages yet. Tap “Add new” to create your first location.' />
        </div>
      )}
      <div className='absolute bottom-0 left-0 bg-transparent w-full pointer-events-none'>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default StoragesWidget;
