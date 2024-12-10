import { FC, useContext } from 'react';
import { Formik } from 'formik';
import CoreContext from '../../core-context.ts';

type RegisterUserWidgetProps = {
  onSuccess: () => void;
};

const RegisterUserWidget: FC<RegisterUserWidgetProps> = (props) => {
  const core = useContext(CoreContext);

  const handleSubmit = async (values: { username: string }) => {
    await core.commands.user.register({ username: values.username });
    props.onSuccess();
  };

  return (
    <div>
      <h1>Register</h1>
      <div>
        <Formik
          initialValues={{ username: '' }}
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (!values.username) {
              errors.username = 'Required';
            }
            return errors;
          }}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit: _handleSubmit }) => (
            <form onSubmit={_handleSubmit}>
              <input
                type='text'
                name='username'
                value={values.username}
                onChange={handleChange}
                className='bg-gray-100'
              />
              <button type='submit' className='border'>
                Login
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterUserWidget;
