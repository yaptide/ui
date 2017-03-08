
import expect from 'expect';
import { call, put } from 'redux-saga/effects';
import { login } from '../../src/routes/Auth/saga';
import { actionType } from '../../src/routes/Auth/reducer';
import api, { endpoint } from '../../src/api';

const testUser = {
  username: 'username',
  password: 'password',
};

const loginSuccessResponse = {
  data: {
    token: 'example token',
  },
};

describe('Auth saga tests', () => {
  it('Login sucess', () => {
    const saga = login(testUser);
    expect(saga.next().value).toEqual(call(api.post, endpoint.LOGIN, testUser));
    expect(saga.next(loginSuccessResponse).value).toEqual(put({
      type: actionType.LOGIN_RESPONSE_SUCCESS,
      token: loginSuccessResponse.data.token,
    }));
    expect(saga.next().done).toBeTruthy();
  });
});
