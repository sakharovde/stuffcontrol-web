import { FC } from 'react';
import StoragesWidget from './widgets/storages-widget.tsx';
import LayoutWidget from './widgets/layout-widget.tsx';

const App: FC = () => {
  return (
    <LayoutWidget>
      <StoragesWidget />
    </LayoutWidget>
  );
};

export default App;
