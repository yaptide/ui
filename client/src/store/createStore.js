/* @flow */

import {
  applyMiddleware,
  createStore as reduxCreateStore,
} from 'redux';
import createLogger from 'redux-logger';
import * as _ from 'lodash';
import makeRootReducer from './reducers';


const logger = createLogger({
  stateTransormer: (state: Object) => _.map(state, e => (e.toJS ? e.toJS() : e)),
});

export const createStore = () => { // eslint-disable-line import/prefer-default-export
  const middleware = [logger];

  return reduxCreateStore(
    makeRootReducer(),
    {},
    applyMiddleware(...middleware),
  );
};
