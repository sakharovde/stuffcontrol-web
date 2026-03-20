import { FC, useContext, useState } from 'react';
import CoreContext from '../core-context.ts';
import { Storage } from '../../domain';
import { Button, Dialog, Form, Input, SafeArea, Space, Toast } from 'antd-mobile';

type Props = {
  data?: Storage;
  onSuccess: () => void;
};

const ChangeStorageWidget: FC<Props> = (props) => {
  const [form] = Form.useForm<{ name: string }>();
  const core = useContext(CoreContext);
  const storageManager = core.getStorageManager();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!props.data;

  const handleSubmitStorage = async (values: { name: string }) => {
    setSubmitting(true);
    try {
      if (props.data) {
        await storageManager.updateStorage({ storage: { id: props.data.id, name: values.name } });
        Toast.show({ icon: 'success', content: 'Storage updated' });
      } else {
        await storageManager.createStorage({ name: values.name });
        Toast.show({ icon: 'success', content: 'Storage created' });
      }
      props.onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStorage = async () => {
    if (!props.data) {
      return;
    }
    const confirmed = await Dialog.confirm({
      content: 'Delete this storage? All batches inside will also be removed.',
      closeOnMaskClick: true,
      confirmText: 'Yes',
      cancelText: 'No',
    });
    if (!confirmed) {
      return;
    }
    await storageManager.removeStorage({ id: props.data.id });
    Toast.show({ icon: 'success', content: 'Storage removed' });
    props.onSuccess();
  };

  return (
    <div className='px-4'>
      <h3 className='text-xl font-semibold'>{isEditing ? 'Edit storage' : 'Add new storage'}</h3>

      <Form
        layout='vertical'
        className='mt-6'
        onFinish={handleSubmitStorage}
        initialValues={{ name: props.data?.name ?? '' }}
        form={form}
      >
        <Form.Item
          label='Storage name'
          name='name'
          rules={[{ required: true, message: 'Please enter name' }]}
          extra={isEditing ? 'Update the display name for this storage' : undefined}
        >
          <Input placeholder='e.g. Pantry' maxLength={42} clearable />
        </Form.Item>
      </Form>
      <Space block direction='vertical' className='mt-6'>
        {isEditing && (
          <Button block color='danger' fill='none' onClick={handleRemoveStorage}>
            Remove storage
          </Button>
        )}
        <Button block color='primary' loading={submitting} disabled={submitting} onClick={() => form.submit()}>
          {isEditing ? 'Save changes' : 'Create storage'}
        </Button>
      </Space>

      <div className='absolute bottom-0 left-0 bg-white w-full'>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default ChangeStorageWidget;
