/* @flow */

import { call } from 'redux-saga/effects';
import api from 'api';
import injectTapEventPlugin from 'react-tap-event-plugin';
import cookie, { key } from './cookie';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

export function* initSaga(): Generator<*, *, *> {
  const token = yield call(cookie.get, key.AUTH_TOKEN);
  if (token) {
    api.saveAuthToken(token);
  }
}

export default initSaga;
