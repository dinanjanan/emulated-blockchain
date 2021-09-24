import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import blockchainReducer from '../features/blockchain/blockchain.slice';

const rootReducer = {
  blockchain: blockchainReducer,
};

export const configureAppStore = <T>(preloadedState?: PreloadedState<T>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production',
  });

  return store;
};
