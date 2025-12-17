import { FC, useContext, useEffect, useState } from 'react';
import CoreContext from '../core-context.ts';
import { Button, Card, SafeArea, Space, Stepper, Tag, Toast } from 'antd-mobile';
import { Batch } from '../../domain';

type Props = {
  batch: Batch;
  onSuccess: () => void;
};

const BatchWidget: FC<Props> = (props) => {
  const batch = props.batch;
  const core = useContext(CoreContext);
  const batchManager = core.getBatchManager();
  const [quantity, setQuantity] = useState(batch.quantity);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setQuantity(batch.quantity);
  }, [batch]);

  const handleSave = async () => {
    setUpdating(true);
    try {
      await batchManager.updateBatch({ ...batch, quantity });
      Toast.show({ icon: 'success', content: 'Quantity updated' });
      props.onSuccess();
    } finally {
      setUpdating(false);
    }
  };

  const expiryLabel = batch.expirationDate ? batch.expirationDate.toISOString().split('T')[0] : null;

  return (
    <div className='px-4 pb-20'>
      <h3 className='text-2xl font-semibold'>{batch.name}</h3>
      <Card className='mt-4 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-xs uppercase text-gray-500'>Quantity</div>
            <div className='text-3xl font-semibold text-blue-600'>{batch.quantity}</div>
          </div>
          <Tag color='primary' bordered={false}>
            Batch ID {batch.id.slice(0, 6)}
          </Tag>
        </div>
        {expiryLabel && (
          <div className='mt-4 text-sm text-gray-600'>
            Expires on <span className='font-medium'>{expiryLabel}</span>
          </div>
        )}
      </Card>

      <Card className='mt-5'>
        <div className='text-sm text-gray-500 mb-3'>Adjust quantity</div>
        <Stepper min={0} value={quantity} onChange={(val) => setQuantity(val ?? 0)} />
      </Card>

      <Space block direction='vertical' className='mt-6'>
        <Button block color='primary' loading={updating} onClick={handleSave}>
          Save changes
        </Button>
      </Space>

      <div className='absolute bottom-0 left-0 bg-white w-full'>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default BatchWidget;
