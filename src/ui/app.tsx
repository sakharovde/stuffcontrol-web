import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Storages from './storages.tsx';
import { FC } from 'react';

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Storages />
    </QueryClientProvider>
  );
};

export default App;
