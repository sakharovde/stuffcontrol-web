import { FC } from 'react';
import { List, SafeArea } from 'antd-mobile';
import { Storage } from '../../domain';

type StorageCardWidgetProps = {
  data: Storage;
  onClick: () => void;
};

const StorageCardWidget: FC<StorageCardWidgetProps> = (props) => {
  return (
    <List.Item
      onClick={props.onClick}
      description={
        <>
          <div>Batches</div>
          <div>Products</div>
        </>
      }
    >
      {props.data.name}
    </List.Item>
  );
};

type StoragesWidgetProps = {
  data?: Storage[];
  onClickStorageCard: (storageId: Storage['id']) => void;
};

const StoragesWidget: FC<StoragesWidgetProps> = (props) => {
  return (
    <>
      <h3 className='text-xl font-semibold px-3 pb-3'>{'Storages'}</h3>
      <List>
        {props.data?.map((storage) => (
          <StorageCardWidget key={storage.id} data={storage} onClick={() => props.onClickStorageCard(storage.id)} />
        ))}
      </List>
      <div className='absolute bottom-0 left-0  bg-white w-full'>
        <SafeArea position='bottom' />
      </div>
    </>
  );
};

export default StoragesWidget;
