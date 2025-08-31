import { FC, PropsWithChildren } from 'react';
import { Button, NavBar, SafeArea } from 'antd-mobile';

type Props = {
  onBack?: () => void;
  backText?: string;
  onAction?: () => void;
  actionText?: string;
};

const LayoutWidget: FC<PropsWithChildren<Props>> = (props) => {
  const needShowBack = !!props.backText && !!props.onBack;
  const needShowAction = !!props.actionText && !!props.onAction;

  const right = needShowAction && (
    <Button color='primary' fill='none' onClick={props.onAction} size='small'>
      {props.actionText}
    </Button>
  );

  return (
    <div className='max-w-lg mx-auto h-full relative bg-white'>
      <div style={{ background: '#ace0ff' }}>
        <SafeArea position='top' />
      </div>
      <NavBar onBack={props.onBack} backIcon={needShowBack} back={props.backText} right={right}></NavBar>
      <div>{props.children}</div>
      <div>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default LayoutWidget;
