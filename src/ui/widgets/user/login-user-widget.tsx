import { FC, useContext } from 'react';
import { Formik } from 'formik';
import CoreContext from '../../core-context.ts';

type LoginUserWidgetProps = {
  onSuccess: () => void;
};

const LoginUserWidget: FC<LoginUserWidgetProps> = (props) => {
  const core = useContext(CoreContext);

  const handleSubmit = async (values: { username: string }) => {
    await core.commands.user.login({ username: values.username });
    props.onSuccess();
  };

  return (
    <div>
      <h1>Login</h1>
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
                autoComplete='webauthn'
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

export default LoginUserWidget;
