import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import blockChainReducer from '../features/blockChain/blockChain.slice';

const rootReducer = {
  blockChain: blockChainReducer,
};

export const configureAppStore = <T>(preloadedState?: PreloadedState<T>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  return store;
};
