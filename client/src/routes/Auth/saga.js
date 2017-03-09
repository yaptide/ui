/* @flow */

import { takeLatest } from 'redux-saga';
import { fork, call, put } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import cookie, { key as cookieKey } from 'store/cookie';
import { actionType } from './reducer';
import type { RegisterData } from './model';

export function* updateAuthToken(token: string): Generator<*, *, *> {
  if (token) {
    yield call(api.saveAuthToken, token);
    yield call(cookie.set, cookieKey.AUTH_TOKEN, token);
  }
}

export function* login(action: { username: string, password: string }): Generator<*, *, *> {
  try {
    const response = yield call(
      api.post,
      endpoint.LOGIN,
      { username: action.username, password: action.password },
    );
    const token = response.data.token;
    yield* updateAuthToken(token);

    yield put({ type: actionType.LOGIN_RESPONSE_SUCCESS, token });
  } catch (error) {
    yield put({ type: actionType.LOGIN_RESPONSE_ERROR, error: error.response.data });
  }
}

export function* register(action: { user: RegisterData }): Generator<*, *, *> {
  try {
    yield call(api.post, endpoint.REGISTER, action.user);
    yield put({ type: actionType.REGISTER_RESPONSE_SUCCESS });
    yield call(login, { username: action.user.username, password: action.user.password });
  } catch (error) {
    yield put({ type: actionType.REGISTER_RESPONSE_ERROR, error: error.response.data });
  }
}

export function* logout(): Generator<*, *, *> {
  yield call(api.saveAuthToken, '');
  yield call(cookie.delete, cookieKey.AUTH_TOKEN);
}

export function* watchLogin(): Generator<*, *, *> {
  yield call(takeLatest, actionType.LOGIN_REQUEST, login);
}

export function* watchRegister(): Generator<*, *, *> {
  yield call(takeLatest, actionType.REGISTER_REQUEST, register);
}

export default function* authSaga(): Generator<*, *, *> {
  // auth initialize code
  yield [
    fork(watchLogin),
    fork(watchRegister),
  ];
}
