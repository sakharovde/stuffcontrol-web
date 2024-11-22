import { FC, PropsWithChildren } from 'react';

const LayoutWidget: FC<PropsWithChildren> = (props) => {
  return <div className='max-w-lg mx-auto h-full'>{props.children}</div>;
};

export default LayoutWidget;
