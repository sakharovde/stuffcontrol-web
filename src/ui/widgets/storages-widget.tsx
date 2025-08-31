import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { StorageDto } from '../../application';
import { List, SafeArea } from 'antd-mobile';

type StorageCardWidgetProps = {
  data: StorageDto;
  onClick: () => void;
};

const StorageCardWidget: FC<StorageCardWidgetProps> = (props) => {
  return <List.Item onClick={props.onClick}>{props.data.name}</List.Item>;
};

type StoragesWidgetProps = {
  data?: StorageDto[];
  onClickAddStorage: () => void;
  onClickStorageCard: (storageId: StorageDto['id']) => void;
};

const StoragesWidget: FC<StoragesWidgetProps> = (props) => {
  return (
    <>
      <List>
        {props.data?.map((storage) => (
          <StorageCardWidget key={storage.id} data={storage} onClick={() => props.onClickStorageCard(storage.id)} />
        ))}
      </List>
      <div className='absolute bottom-0 left-0  bg-gray-100 w-full'>
        <div className='h-10 flex items-center px-3'>
          <button className='flex items-center gap-1 text-blue-600 font-medium' onClick={props.onClickAddStorage}>
            <FontAwesomeIcon icon={faCirclePlus} />
            <span>Add storage</span>
          </button>
        </div>
        <SafeArea position='bottom' />
      </div>
    </>
  );
};

export default StoragesWidget;
