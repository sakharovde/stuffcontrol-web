import { FC } from 'react';
import { StorageDto } from '../../application';
import { List, SafeArea } from 'antd-mobile';

type StorageCardWidgetProps = {
  data: StorageDto;
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
  data?: StorageDto[];
  onClickStorageCard: (storageId: StorageDto['id']) => void;
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
