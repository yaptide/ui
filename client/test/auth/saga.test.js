
import expect from 'expect';
import { call, put } from 'redux-saga/effects';
import * as authSaga from '../../src/routes/Auth/saga';
import { actionType } from '../../src/routes/Auth/reducer';
import api, { endpoint } from '../../src/api';
import cookie, { key as cookieKey } from '../../src/store/cookie';

const testUser = {
  username: 'username',
  password: 'password',
};

const testRegisterUser = {
  username: 'username',
  password: 'password',
};

const loginSuccessResponse = {
  data: {
    token: 'example token',
  },
};

describe('Auth saga tests', () => {
  it('Login success', () => {
    const saga = authSaga.login({ user: testUser });
    expect(saga.next().value).toEqual(call(api.post, endpoint.LOGIN, testUser));
    expect(saga.next(loginSuccessResponse).value)
      .toEqual(call(api.saveAuthToken, loginSuccessResponse.data.token));
    expect(saga.next().value)
      .toEqual(call(cookie.set, cookieKey.AUTH_TOKEN, loginSuccessResponse.data.token));
    expect(saga.next().value).toEqual(put({
      type: actionType.LOGIN_RESPONSE_SUCCESS,
      token: loginSuccessResponse.data.token,
    }));
    expect(saga.next().done).toBeTruthy();
  });

  it('Login api call error', () => {
    const saga = authSaga.login({ user: testUser });

    const loginError = {
      response: { data: 'errorMessage' },
    };

    expect(saga.next().value).toEqual(call(api.post, endpoint.LOGIN, testUser));
    expect(saga.throw(loginError).value).toEqual(
      put({ type: actionType.LOGIN_RESPONSE_ERROR, error: loginError.response.data }),
    );
    expect(saga.next().done).toBeTruthy();
  });

  it('Register success', () => {
    const saga = authSaga.register({ user: testRegisterUser });

    expect(saga.next().value).toEqual(call(api.post, endpoint.REGISTER, testRegisterUser));
    expect(saga.next().value).toEqual(put({ type: actionType.REGISTER_RESPONSE_SUCCESS }));
    expect(saga.next().value).toEqual(call(authSaga.login, { user: testRegisterUser }));
    expect(saga.next().done).toBeTruthy();
  });

  it('Register api call error', () => {
    const saga = authSaga.register({ user: testRegisterUser });

    const registerError = {
      response: { data: 'errorMessage' },
    };

    expect(saga.next().value).toEqual(call(api.post, endpoint.REGISTER, testRegisterUser));
    expect(saga.throw(registerError).value).toEqual(
      put({ type: actionType.REGISTER_RESPONSE_ERROR, error: registerError.response.data }),
    );
    expect(saga.next().done).toBeTruthy();
  });

  it('Logout success', () => {
    const saga = authSaga.logout();

    expect(saga.next().value).toEqual(call(api.saveAuthToken, ''));
    expect(saga.next().value).toEqual(call(cookie.delete, cookieKey.AUTH_TOKEN));
  });
});
