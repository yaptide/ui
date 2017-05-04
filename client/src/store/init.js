/* @flow */

import { call, put } from 'redux-saga/effects';
import api from 'api';
import injectTapEventPlugin from 'react-tap-event-plugin';
import cookie, { key } from './cookie';
import { actionType as authActionType } from '../routes/Auth/reducer';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

export function* initSaga(): Generator<*, *, *> {
  const token = yield call(cookie.get, key.AUTH_TOKEN);
  if (token) {
    api.saveAuthToken(token);
    yield put({ type: authActionType.LOGIN_RESPONSE_SUCCESS, token });
  }
}

export default initSaga;
