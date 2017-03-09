/* @flow */

import { call } from 'redux-saga/effects';
import api from 'api';
import cookie, { key } from './cookie';

export function* initSaga(): Generator<*, *, *> {
  const token = yield call(cookie.get, key.AUTH_TOKEN);
  if (token) {
    api.saveAuthToken(token);
  }
}

export default initSaga;
