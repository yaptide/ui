/* @flow */

import {
  applyMiddleware,
  createStore as reduxCreateStore,
} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import * as _ from 'lodash';
import rootReducer from './reducers';
import rootSaga from './sagas';


const logger = createLogger({
  stateTransormer: (state: Object) => _.map(state, e => (e.toJS ? e.toJS() : e)),
});

const saga = createSagaMiddleware();

export const createStore = () => { // eslint-disable-line import/prefer-default-export
  const middleware = [
    thunk,
    saga,
    logger,
  ];

  const reduxStore = reduxCreateStore(
    rootReducer,
    {},
    applyMiddleware(...middleware),
  );

  saga.run(rootSaga);

  return reduxStore;
};
