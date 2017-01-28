
import {
  applyMiddleware,
  createStore as reduxCreateStore,
} from 'redux';
import createLogger from 'redux-logger';

import { makeRootReducer } from './reducers';

const logger = createLogger();

export const createStore = () => {
  const middleware = [logger];

  return reduxCreateStore(
    makeRootReducer(),
    {},
    applyMiddleware(...middleware),
  );
};
