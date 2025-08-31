import { FC, PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { SafeArea } from 'antd-mobile';

type Props = {
  onBack?: () => void;
  backText?: string;
  onAction?: () => void;
  actionText?: string;
};

const LayoutWidget: FC<PropsWithChildren<Props>> = (props) => {
  const needShowBack = !!props.backText && !!props.onBack;
  const needShowAction = !!props.actionText && !!props.onAction;
  const needShowHeader = needShowAction || needShowBack;

  return (
    <div className='max-w-lg mx-auto h-full relative bg-white'>
      <div style={{ background: '#ace0ff' }}>
        <SafeArea position='top' />
      </div>
      {needShowHeader && (
        <div className='p-3 flex justify-between'>
          {needShowBack ? (
            <button className='flex text-blue-600 gap-2 items-center' onClick={props.onBack}>
              <FontAwesomeIcon icon={faAngleLeft} />
              <span>{props.backText}</span>
            </button>
          ) : (
            <div />
          )}
          {needShowAction ? (
            <button className='flex text-blue-600 gap-2 items-center' onClick={props.onAction}>
              <span>{props.actionText}</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      )}
      <div>{props.children}</div>
      <div>
        <SafeArea position='bottom' />
      </div>
    </div>
  );
};

export default LayoutWidget;
