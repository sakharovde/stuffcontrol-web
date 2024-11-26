import { FC, PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

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
    <div className='max-w-lg mx-auto h-screen relative bg-white'>
      {needShowHeader && (
        <div className='p-3 flex justify-between'>
          {needShowBack && (
            <button className='flex text-blue-600 gap-2 items-center' onClick={props.onBack}>
              <FontAwesomeIcon icon={faAngleLeft} />
              <span>{props.backText}</span>
            </button>
          )}
          {needShowAction && (
            <button className='flex text-blue-600 gap-2 items-center' onClick={props.onAction}>
              <span>{props.actionText}</span>
            </button>
          )}
        </div>
      )}
      {props.children}
    </div>
  );
};

export default LayoutWidget;
