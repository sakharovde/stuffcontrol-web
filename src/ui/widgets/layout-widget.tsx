import { FC, PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

type Props = {
  onBack?: () => void;
  backText?: string;
};

const LayoutWidget: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <div className='max-w-lg mx-auto h-full relative'>
      {!!props.backText && !!props.onBack && (
        <div className='p-3'>
          <button className='flex text-blue-600 gap-2 items-center' onClick={props.onBack}>
            <FontAwesomeIcon icon={faAngleLeft} />
            <span>{props.backText}</span>
          </button>
        </div>
      )}
      {props.children}
    </div>
  );
};

export default LayoutWidget;
