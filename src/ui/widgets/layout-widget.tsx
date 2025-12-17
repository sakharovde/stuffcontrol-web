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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
      <div className='sticky top-0 z-10 backdrop-blur bg-white/80 shadow-sm w-full'>
        <div style={{ background: '#ace0ff' }}>
          <SafeArea position='top' />
        </div>
        <div className='max-w-lg mx-auto w-full px-4'>
          <NavBar onBack={props.onBack} backArrow={needShowBack} back={props.backText} right={right} />
        </div>
      </div>
      <div className='max-w-lg mx-auto min-h-screen flex flex-col px-3 py-4'>
        <div className='flex-1 w-full'>{props.children}</div>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default LayoutWidget;
