import { createContext, ReactNode, useContext, useState } from 'react';

import { Spinner } from '~/components/ui/spinner';

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <Spinner />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Response('useLoading은 LoadingProvider 안에서만 사용해야 합니다!', { status: 500 });
  }
  return context;
};
