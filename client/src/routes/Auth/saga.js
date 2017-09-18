/* @flow */

import { takeLatest, eventChannel } from 'redux-saga';
import { fork, call, put, take } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import localStorage, { key as storageKey } from 'store/localStorage';
import router from 'utils/router';
import { actionType } from './reducer';
import type { RegisterData, LoginData } from './model';

export function* updateAuthToken(token: string): Generator<*, *, *> {
  if (token) {
    yield call(api.saveAuthToken, token);
    yield call(localStorage.set, storageKey.AUTH_TOKEN, token);
  }
}

export function* login(action: { user: LoginData }): Generator<*, *, *> {
  try {
    const response = yield call(
      api.post,
      endpoint.LOGIN,
      { username: action.user.username, password: action.user.password },
    );
    yield call(localStorage.clear);
    const token = response.data.token;
    yield* updateAuthToken(token);

    yield put({ type: actionType.LOGIN_RESPONSE_SUCCESS, token });
    router.push('project/list');
  } catch (error) {
    yield put({ type: actionType.LOGIN_RESPONSE_ERROR, error: error.response.data });
  }
}

export function* register(action: { user: RegisterData }): Generator<*, *, *> {
  try {
    yield call(api.post, endpoint.REGISTER, action.user);
    yield put({ type: actionType.REGISTER_RESPONSE_SUCCESS });
    yield call(login, { user: {
      username: action.user.username,
      password: action.user.password,
    } });
  } catch (error) {
    yield put({ type: actionType.REGISTER_RESPONSE_ERROR, error: error.response.data });
  }
}

export function* logout(): Generator<*, *, *> {
  yield call(api.saveAuthToken, '');
  yield call(localStorage.clear);
  yield call(router.push, '/logout');
}

export function* watchLogin(): Generator<*, *, *> {
  yield call(takeLatest, actionType.LOGIN_REQUEST, login);
}

export function* watchRegister(): Generator<*, *, *> {
  yield call(takeLatest, actionType.REGISTER_REQUEST, register);
}

export function* watchLogout(): Generator<*, *, *> {
  yield call(takeLatest, actionType.LOGOUT, logout);
}

export function* watch401InterceptorChannel(): Generator<*, *, *> {
  const emitterWrapper = (emitter) => {
    api.registerInterceptor(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 401) {
          emitter(401);
        }
        throw error;
      },
    );
    return () => null;
  };
  const channel = eventChannel(emitterWrapper);

  for (;;) {
    try {
      yield take(channel);
      yield put({ type: actionType.LOGOUT });
    } catch (error) {
      // ignore errors
    }
  }
}

export default function* authSaga(): Generator<*, *, *> {
  yield [
    fork(watch401InterceptorChannel),
    fork(watchLogin),
    fork(watchRegister),
    fork(watchLogout),
  ];
}
