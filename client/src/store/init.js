/* @flow */

import { call, put } from 'redux-saga/effects';
import api from 'api';
import injectTapEventPlugin from 'react-tap-event-plugin';
import localStorage, { key } from './localStorage';
import { actionType as authActionType } from '../routes/Auth/reducer';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

export function* initSaga(): Generator<*, *, *> {
  const token = yield call(localStorage.get, key.AUTH_TOKEN);
  if (token) {
    api.saveAuthToken(token);
    yield put({ type: authActionType.LOGIN_RESPONSE_SUCCESS, token });
  }
}

export default initSaga;
