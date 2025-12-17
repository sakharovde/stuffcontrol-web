import { FC, useContext, useEffect, useMemo, useState } from 'react';
import CoreContext from '../core-context.ts';
import { Storage, Batch } from '../../domain';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Picker,
  SafeArea,
  Segmented,
  Space,
  Toast,
  Dialog,
} from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';

type Props = {
  data?: Batch;
  storage: Storage;
  onSuccess: () => void;
};

interface FormValues {
  name: string;
  quantity: number;
  expirationDate?: Date;
}

type Mode = 'new' | 'existing';

const ChangeBatchWidget: FC<Props> = (props) => {
  const core = useContext(CoreContext);
  const batchManager = core.getBatchManager();
  const [form] = Form.useForm<FormValues>();
  const [mode, setMode] = useState<Mode>('new');
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [batches, setBatches] = useState<Batch[]>(batchManager.getBatches(props.storage.id));
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(props.data?.quantity ?? 0);
  const [updating, setUpdating] = useState(false);

  const isEditing = !!props.data;

  useEffect(() => {
    const update = () => setBatches(batchManager.getBatches(props.storage.id));
    batchManager.subscribe(update);
    batchManager.loadBatches(props.storage.id, { force: true });
    return () => batchManager.unsubscribe(update);
  }, [batchManager, props.storage.id]);

  const allProductNames = useMemo(() => {
    const seen = new Set<string>();
    batches.forEach((batch) => {
      if (!seen.has(batch.name.trim())) {
        seen.add(batch.name.trim());
      }
    });
    return Array.from(seen.values()).sort();
  }, [batches]);

  const pickerColumns = useMemo(
    () => [
      allProductNames.map((name) => ({
        label: name,
        value: name,
      })),
    ],
    [allProductNames]
  );

  const handleRemove = async () => {
    if (!props.data) {
      return;
    }
    const confirmed = await Dialog.confirm({
      content: 'Удалить выбранную партию?',
      closeOnMaskClick: true,
      confirmText: 'Да',
      cancelText: 'Нет',
    });
    if (!confirmed) {
      return;
    }
    setRemoving(true);
    try {
      await batchManager.removeBatch(props.data.id);
      Toast.show({ icon: 'success', content: 'Партия удалена' });
      props.onSuccess();
    } finally {
      setRemoving(false);
    }
  };

  const handleCreate = async (values: FormValues) => {
    const productName = mode === 'existing' ? selectedProduct?.trim() : values.name?.trim();
    if (!productName) {
      Toast.show({ icon: 'fail', content: mode === 'existing' ? 'Выберите продукт' : 'Введите имя продукта' });
      return;
    }
    setSubmitting(true);
    try {
      await batchManager.createBatch({
        storageId: props.storage.id,
        name: productName,
        quantity: values.quantity,
        expirationDate: values.expirationDate ?? null,
      });
      Toast.show({ icon: 'success', content: 'Партия добавлена' });
      props.onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!props.data) {
      return;
    }
    setUpdating(true);
    try {
      await batchManager.updateBatch({ ...props.data, quantity: editingQuantity });
      Toast.show({ icon: 'success', content: 'Количество обновлено' });
      props.onSuccess();
    } finally {
      setUpdating(false);
    }
  };

  const existingBatches = useMemo(() => batches.filter((batch) => batch.storageId === props.storage.id), [batches, props.storage.id]);

  if (isEditing && props.data) {
    const adjustEditingQuantity = (delta: number) => {
      setEditingQuantity((prev) => Math.max(0, prev + delta));
    };

    return (
      <div className='px-4 pb-24'>
        <h3 className='text-2xl font-semibold'>{props.data.name}</h3>
        <p className='text-sm text-gray-500 mt-1'>Добавить партию</p>

        <div className='mt-8'>
          <div className='text-xs uppercase text-gray-500 mb-2'>Количество</div>
          <div className='flex items-stretch gap-3'>
            <Button block onClick={() => adjustEditingQuantity(-1)} disabled={editingQuantity <= 0}>
              -
            </Button>
            <Input readOnly value={editingQuantity.toString()} className='text-center text-lg font-semibold' />
            <Button block onClick={() => adjustEditingQuantity(1)}>+</Button>
          </div>
        </div>

        <Space block direction='vertical' className='mt-6'>
          <Button block color='primary' loading={updating} onClick={handleUpdate}>
            Сохранить
          </Button>
          <Button block color='danger' fill='none' loading={removing} onClick={handleRemove}>
            Удалить партию
          </Button>
        </Space>

        <div className='absolute bottom-0 left-0 bg-white w-full'>
          <SafeArea position='bottom' />
        </div>
      </div>
    );
  }

  const quantity = Form.useWatch('quantity', form) ?? 0;
  const adjustQuantity = (delta: number) => {
    const next = Math.max(0, quantity + delta);
    form.setFieldsValue({ quantity: next });
  };

  return (
    <div className='px-4 pb-24'>
      <Segmented
        block
        className='mt-2'
        value={mode}
        onChange={(value) => setMode(value as Mode)}
        options={[
          { label: 'Новый', value: 'new' },
          { label: 'Существующий', value: 'existing', disabled: !allProductNames.length },
        ]}
      />

      {mode === 'existing' && (
        <Card className='mt-6'>
          <div className='text-xs uppercase text-gray-500 mb-2'>Выбор продукта</div>
          {allProductNames.length ? (
            <>
              <Button block onClick={() => setPickerVisible(true)}>
                {selectedProduct || 'Нажмите, чтобы выбрать'}
              </Button>
              <Picker
                columns={pickerColumns}
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                value={selectedProduct ? [selectedProduct] : undefined}
                onConfirm={(values) => {
                  setSelectedProduct(values[0] ?? null);
                  setPickerVisible(false);
                }}
              />
            </>
          ) : (
            <div className='text-sm text-gray-500'>Нет существующих продуктов</div>
          )}
        </Card>
      )}

      <Form
        layout='vertical'
        form={form}
        className='mt-6'
        initialValues={{ quantity: 1 }}
        onFinish={handleCreate}
      >
        <Form.Item name='quantity' hidden>
          <Input />
        </Form.Item>
        {mode === 'new' && (
          <Form.Item
            label='Имя продукта'
            name='name'
            rules={[{ required: true, message: 'Введите имя продукта' }]}
            extra='Будет отображаться внутри склада'
          >
            <Input placeholder='Например, бананы' clearable maxLength={64} />
          </Form.Item>
        )}

        <Form.Item
          label='Срок годности'
          name='expirationDate'
          trigger='onConfirm'
          onClick={(e, datePickerRef) => {
            datePickerRef?.open();
          }}
        >
          <DatePicker>
            {(value) => (value ? value.toISOString().split('T')[0] : 'Выберите дату (необязательно)')}
          </DatePicker>
        </Form.Item>
      </Form>

      <div className='mt-6'>
        <div className='text-xs uppercase text-gray-500 mb-2'>Количество</div>
        <div className='flex items-stretch gap-3'>
          <Button type='button' block onClick={() => adjustQuantity(-1)} disabled={quantity <= 0}>
            -
          </Button>
          <Input readOnly value={quantity.toString()} className='text-center text-lg font-semibold' />
          <Button type='button' block onClick={() => adjustQuantity(1)}>
            +
          </Button>
        </div>
      </div>

      <Space block direction='vertical' className='mt-6'>
        <Button block color='primary' loading={submitting} onClick={() => form.submit()}>
          Сохранить
        </Button>
      </Space>

      <div className='absolute bottom-0 left-0 bg-white w-full'>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default ChangeBatchWidget;
