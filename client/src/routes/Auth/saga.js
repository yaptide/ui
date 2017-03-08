/* @flow */

import { takeLatest } from 'redux-saga';
import { fork, call, put } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import { actionType } from './reducer';

export function* login(action: { username: string, password: string }): Generator<*, *, *> {
  try {
    const response = yield call(
      api.post,
      endpoint.LOGIN,
      { username: action.username, password: action.password },
    );
    const token = response.data.token;
    yield put({ type: actionType.LOGIN_RESPONSE_SUCCESS, token });
  } catch (error) {
    yield put({ type: actionType.LOGIN_RESPONSE_ERROR });
  }
}

export function* watchLogin(): Generator<*, *, *> {
  yield call(takeLatest, actionType.LOGIN_REQUEST, login);
}

export default function* authSaga(): Generator<*, *, *> {
  // auth initialize code
  yield [
    fork(watchLogin),
  ];
}
