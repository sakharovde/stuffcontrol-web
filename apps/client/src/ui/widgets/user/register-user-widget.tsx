import { FC } from 'react';
import { Button, Card, Form, Input, Space, Toast } from 'antd-mobile';

type Props = {
  onSuccess: () => void;
};

type FormValues = {
  name: string;
  email: string;
  password: string;
};

const RegisterUserWidget: FC<Props> = ({ onSuccess }) => {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = async (values: FormValues) => {
    if (!values.name?.trim()) {
      Toast.show({ icon: 'fail', content: 'Введите имя' });
      return;
    }
    if (!values.email || !values.password) {
      Toast.show({ icon: 'fail', content: 'Укажите email и пароль' });
      return;
    }
    Toast.show({ icon: 'success', content: 'Регистрация недоступна (демо)' });
    onSuccess();
  };

  return (
    <Card className='mt-6 shadow-sm'>
      <Form layout='vertical' form={form} onFinish={handleSubmit}>
        <Form.Item name='name' label='Имя' rules={[{ required: true, message: 'Введите имя' }]}>
          <Input placeholder='Иван Иванов' clearable />
        </Form.Item>
        <Form.Item name='email' label='Email' rules={[{ required: true, message: 'Введите email' }]}>
          <Input placeholder='you@example.com' type='email' clearable />
        </Form.Item>
        <Form.Item name='password' label='Пароль' rules={[{ required: true, message: 'Введите пароль' }]}>
          <Input placeholder='••••••••' type='password' clearable />
        </Form.Item>
        <Space block direction='vertical' className='mt-4'>
          <Button block color='primary' onClick={() => form.submit()}>
            Зарегистрироваться
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default RegisterUserWidget;
