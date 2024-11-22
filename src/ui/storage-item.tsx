import { FC } from 'react';
import StorageItemModel from '../core/domain/models/storage-item.ts';

type Props = {
  data: StorageItemModel;
};

const StorageItem: FC<Props> = (props) => {
  return (
    <div className='flex justify-between'>
      <div>{props.data.id}</div>
      <div>{props.data.quantity}</div>
    </div>
  );
};

export default StorageItem;
