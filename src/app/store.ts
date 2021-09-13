import { configureStore } from '@reduxjs/toolkit';
import blockChainReducer from '../features/blockChain/blockChain.slice';

const rootReducer = {
  blockChain: blockChainReducer,
};

const updateReducerOnHotModule = (
  store,
  rootReducer,
  featureName,
  sliceName = featureName
) => {
  // Use webpack's hot module replacement to reload redux slices when they are changed
  module.hot.accept(`../features/${featureName}/${sliceName}.slice`, () =>
    store.replaceReducer(rootReducer)
  );
};

export const configureAppStore = preloadedState => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    updateReducerOnHotModule(store, rootReducer, 'blockChain');
  }

  return store;
};
