/* @flow */

import { fork, call } from 'redux-saga/effects';
import authSaga from 'routes/Auth/saga';

import { initSaga } from './init';

export default function* rootSaga(): Generator<*, *, *> {
  yield call(initSaga);
  yield [
    fork(authSaga),
  ];
}
